import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const setup = searchParams.get('setup');
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (setup === 'true') {
    if (!token) {
      return NextResponse.json({ success: false, error: 'TELEGRAM_BOT_TOKEN não configurado no .env.local' }, { status: 400 });
    }

    try {
      const host = request.headers.get('host') || 'localhost:3000';
      const proto = request.headers.get('x-forwarded-proto') || 'http';
      const webhookUrl = `${proto}://${host}/api/telegram`;

      const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
      const data = await response.json();

      return NextResponse.json({ success: true, webhookUrl, data });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ active: true, bot: 'Descubra Hub Webhook Active' });
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Token do Telegram não configurado' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const message = body.message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const voice = message.voice || message.audio;
    const text = message.text ? message.text.trim() : '';

    // A. VOICE/AUDIO LOGIC WITH GEMINI 1.5 FLASH (INLINE AUDIO BASE64 INPUT)
    if (voice) {
      await sendTelegramMessage(token, chatId, `🎤 *Recebi seu áudio! Processando acompanhamento com IA...*`);

      const fileId = voice.file_id;
      const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      const fileData = await fileRes.json();

      if (!fileData.ok) {
        await sendTelegramMessage(token, chatId, `❌ *Erro ao processar áudio:* Não consegui recuperar o arquivo do Telegram.`);
        return NextResponse.json({ ok: true });
      }

      const filePath = fileData.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

      const audioRes = await fetch(fileUrl);
      const audioBuffer = await audioRes.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      const mimeType = voice.mime_type || 'audio/ogg';

      const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!geminiApiKey) {
        await sendTelegramMessage(token, chatId, `⚠️ *Erro de Configuração:* A chave \`GOOGLE_GENERATIVE_AI_API_KEY\` não está configurada no servidor.`);
        return NextResponse.json({ ok: true });
      }

      const youths = db.getYouthList();
      const youthListText = youths.map(y => `ID: "${y.id}", Nome Completo: "${y.nome_completo}"`).join('\n');

      const prompt = `Você é o assistente técnico de inteligência artificial do Programa Descubra Sebrae.
Analise o áudio enviado pelo técnico de referência descrevendo o acompanhamento ou atendimento de um jovem.
Sua missão é:
1. Identificar qual jovem da lista abaixo é mencionado no áudio (baseando-se no nome falado).
Lista de Jovens Cadastrados no Sistema:
${youthListText}

2. Extrair os dados estruturados do áudio e convertê-los em um objeto JSON válido.
O JSON deve ter exatamente os seguintes campos e chaves:
- "jovem_id": O ID exato do jovem correspondente da lista acima. Se não tiver certeza absoluta ou não encontrar correspondência plausível, use null.
- "nome_jovem": O nome do jovem conforme falado no áudio.
- "tipo_contato": Mapeie para um destes canais exatos: 'Visita Domiciliar', 'Contato Telefônico', 'WhatsApp', 'Reunião Familiar', 'Acompanhamento Escolar', 'Feedback do Curso' ou 'Outro'.
- "relato_detalhado": Transcrição ou resumo focado e completo em português de todas as informações ditas sobre o atendimento do jovem.
- "status_momento": O status do jovem inferido do áudio. Deve ser exatamente um destes: 'Pendente', 'Em Curso', 'Alerta', 'Evadido', 'Concluído', 'Contratado'.
- "motivo_evasao": Se o status_momento for 'Evadido', extraia o motivo. Deve ser exatamente um destes: 'Problema com Transporte', 'Conflito de Horário com Escola', 'Necessidade de Renda Imediata', 'Falta de Interesse', 'Mudança de Endereço', 'Problema de Saúde', 'Outros'. Se não for evadido, use null.
- "confidence": Um número decimal entre 0.0 e 1.0 indicando sua certeza de ter correspondido o jovem correto.

Regra Absoluta: Retorne estritamente o objeto JSON puro, sem marcações de bloco de código (\`\`\`json) e sem explicações prévias ou pós-texto.`;

      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: audioBase64
                    }
                  },
                  {
                    text: prompt
                  }
                ]
              }]
            })
          }
        );

        const geminiData = await geminiRes.json();
        let geminiText = '';

        if (geminiData.candidates && geminiData.candidates[0]?.content?.parts[0]) {
          geminiText = geminiData.candidates[0].content.parts[0].text;
        } else {
          throw new Error(geminiData.error?.message || 'Resposta inválida do Gemini');
        }

        const cleanJson = geminiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const extracted = JSON.parse(cleanJson);

        if (extracted.jovem_id && extracted.confidence >= 0.5) {
          db.addFollowUp({
            jovem_id: extracted.jovem_id,
            tecnico_name: 'Relato por Voz (Telegram)',
            tipo_contato: extracted.tipo_contato || 'Outro',
            relato_detalhado: extracted.relato_detalhado,
            status_momento: extracted.status_momento || 'Pendente',
            motivo_evasao: extracted.motivo_evasao || undefined
          });

          const confirmation = `✅ *Acompanhamento Gravado com Sucesso via IA!* 🎤\n\n` +
            `👤 *Jovem:* ${extracted.nome_jovem} (ID: \`${extracted.jovem_id}\`)\n` +
            `📞 *Tipo de Contato:* ${extracted.tipo_contato}\n` +
            `📈 *Status Atualizado:* ${extracted.status_momento}\n` +
            `📝 *Resumo do Relato:* _${extracted.relato_detalhado}_\n\n` +
            `🪙 _O jovem recebeu +30 pontos de engajamento!_\n` +
            `🌐 _Informações salvas e sincronizadas com o Supabase._`;

          await sendTelegramMessage(token, chatId, confirmation);
        } else {
          const fallbackMsg = `⚠️ *Acompanhamento por Áudio:* Não consegui encontrar um jovem correspondente com segurança.\n\n` +
            `🗣️ *Nome Entendido:* "${extracted.nome_jovem || 'Não identificado'}"\n` +
            `📝 *Resumo do Áudio:* ${extracted.relato_detalhado || 'Sem transcrição'}\n\n` +
            `*Dica:* Tente gravar novamente mencionando o nome completo do jovem de forma clara ou digite o relato no sistema.`;

          await sendTelegramMessage(token, chatId, fallbackMsg);
        }
      } catch (err: any) {
        await sendTelegramMessage(token, chatId, `❌ *Erro no processamento da IA:* Não foi possível processar o áudio. Detalhes: ${err.message}`);
      }
    }
    // B. TEXT PROCESSING LOGIC
    else if (text) {
      // 1. COMANDO: /start
      if (text.startsWith('/start')) {
        const welcome = `Olá! Eu sou o *Descubra Hub Bot*! 🤖\n\nFui integrado com sucesso ao sistema do *Programa Descubra Sebrae*.\n\nEstou pronto para ajudar técnicos de assistência social e parceiros a acompanhar jovens em vulnerabilidade.\n\n*Comandos Disponíveis:*\n📊 /status - Métricas gerais em tempo real da plataforma.\n⚠️ /alertas - Lista de jovens com alertas críticos ativos.\n👤 /jovem <nome> - Busca rápida de perfil e score de um jovem.\n🎤 *Enviar Áudio* - Grave uma voz descrevendo um atendimento e a IA cadastrará o acompanhamento na hora!\n\n💡 *Dica:* Você também pode colar um relato de conversa aqui e eu usarei a *IA Gemini* para analisar os riscos e recomendar intervenções técnicas!`;
        await sendTelegramMessage(token, chatId, welcome);
      }
      // 2. COMANDO: /status
      else if (text.startsWith('/status')) {
        const diagnostics = db.getDiagnostics();
        const totalJovens = diagnostics.counters.total;
        const concluidos = diagnostics.counters.concluidos;
        const contratados = diagnostics.counters.contratados;
        const emCurso = diagnostics.counters.emCurso;
        const encaminhados = concluidos + contratados + emCurso;
        const taxaEncaminhamento = totalJovens > 0 ? Math.round((encaminhados / totalJovens) * 100) : 0;
        const taxaEmpregabilidade = diagnostics.counters.taxaEmpregabilidade;
        const totalAlertas = diagnostics.counters.alertas;
        
        const empresas = db.getEmpresas().length;
        const unidades = db.getUnidades().length;

        const report = `📊 *Diagnóstico Geral em Tempo Real*\n\n` +
          `👤 *Jovens Cadastrados:* ${totalJovens}\n` +
          `💼 *Empresas Parceiras:* ${empresas}\n` +
          `🏠 *Unidades CRAS/CREAS:* ${unidades}\n\n` +
          `📈 *Taxa de Encaminhamento:* ${taxaEncaminhamento}%\n` +
          `🎯 *Taxa de Empregabilidade:* ${taxaEmpregabilidade}%\n` +
          `⚠️ *Alertas Críticos Ativos:* ${totalAlertas}\n\n` +
          `🌐 _Dados sincronizados em tempo real com o Supabase Cloud._`;
        
        await sendTelegramMessage(token, chatId, report);
      }
      // 3. COMANDO: /alertas
      else if (text.startsWith('/alertas')) {
        const jovens = db.getYouthList();
        const alertas = jovens
          .filter(j => j.status_atual === 'Alerta' || j.score_vulnerabilidade >= 7)
          .slice(0, 5);

        if (alertas.length === 0) {
          await sendTelegramMessage(token, chatId, `✅ *Tudo sob controle!* Nenhum jovem em estado crítico ou de alerta foi encontrado no momento.`);
        } else {
          let list = `⚠️ *Alertas Críticos e Prioritários:* \n\n`;
          alertas.forEach((a, i) => {
            const riscoLabel = a.score_vulnerabilidade >= 8 ? 'CRÍTICO 🚨' : 'ALTO ⚠️';
            list += `${i + 1}. *${a.nome_completo}*\n` +
              `   📍 Cidade: ${a.cidade} · Bairro: ${a.bairro}\n` +
              `   📊 Score de Vulnerabilidade: *${a.score_vulnerabilidade}/10* (${riscoLabel})\n` +
              `   📞 Contato: ${a.telefone}\n\n`;
          });
          list += `💡 _Recomenda-se que o técnico do CRAS/CREAS entre em contato com o jovem para realizar a triagem presencial._`;
          await sendTelegramMessage(token, chatId, list);
        }
      }
      // 4. COMANDO: /jovem
      else if (text.startsWith('/jovem')) {
        const queryName = text.replace('/jovem', '').trim();
        if (!queryName) {
          await sendTelegramMessage(token, chatId, `🔍 Para pesquisar, utilize o formato: \n\`/jovem <nome>\` (ex: \`/jovem Marcos\`)`);
        } else {
          const jovens = db.getYouthList();
          const match = jovens.find(j => 
            j.nome_completo.toLowerCase().includes(queryName.toLowerCase())
          );

          if (!match) {
            await sendTelegramMessage(token, chatId, `❌ Jovem *"${queryName}"* não foi encontrado no banco de dados do Descubra Sebrae.`);
          } else {
            const riscoLabel = match.score_vulnerabilidade >= 8 ? 'Crítico 🚨' : match.score_vulnerabilidade >= 4 ? 'Médio ⚠️' : 'Baixo ✅';
            const profile = `👤 *Perfil do Jovem Encontrado*\n\n` +
              `*Nome:* ${match.nome_completo}\n` +
              `*Idade:* ${calcularIdade(match.data_nascimento)} anos\n` +
              `*Cidade:* ${match.cidade} · Bairro: ${match.bairro}\n` +
              `*Telefone:* ${match.telefone}\n` +
              `*Status:* ${match.status_atual}\n\n` +
              `📊 *Vulnerabilidade Social:* \n` +
              `· Score: *${match.score_vulnerabilidade}/10* (Risco ${riscoLabel})\n` +
              `· Escolaridade: ${match.escolaridade}\n` +
              `· Responsável: ${match.nome_responsavel || 'Não cadastrado'}\n\n` +
              `🪙 *Pontos de Engajamento:* ${match.pontos_gamificacao || 0} pts`;
            
            await sendTelegramMessage(token, chatId, profile);
          }
        }
      }
      // 5. TEXTO LIVRE: ANÁLISE COM GEMINI
      else {
        await sendTelegramMessage(token, chatId, `🤖 *Analisando seu relato de atendimento com a IA Gemini...* Por favor, aguarde.`);

        const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!geminiApiKey) {
          await sendTelegramMessage(token, chatId, `⚠️ *Erro de Configuração:* A chave \`GOOGLE_GENERATIVE_AI_API_KEY\` não foi configurada no servidor. Não foi possível realizar a análise.`);
        } else {
          try {
            const analysis = await analyzeRelatoWithGemini(geminiApiKey, text);
            const responseText = `🧠 *Parecer Técnico da IA Gemini:*\n\n${analysis}\n\n_Análise realizada em tempo real via API do Google Gemini._`;
            await sendTelegramMessage(token, chatId, responseText);
          } catch (err: any) {
            await sendTelegramMessage(token, chatId, `❌ *Erro ao processar a IA:* Não foi possível conectar ao Google Gemini. Detalhes: ${err.message}`);
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error handling Telegram POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helpers
async function sendTelegramMessage(token: string, chatId: number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error('Erro ao enviar mensagem para o Telegram:', err);
  }
}

function calcularIdade(dataNasc: string) {
  if (!dataNasc) return '—';
  try {
    const parts = dataNasc.split('-');
    if (parts.length !== 3) return '—';
    const birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch {
    return '—';
  }
}

async function analyzeRelatoWithGemini(apiKey: string, text: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Você é um analista de vulnerabilidade social especialista do Programa Descubra Sebrae.
Analise a transcrição de atendimento técnico ou diálogo a seguir e forneça um parecer consolidado em formato Markdown contendo:
1. 🚨 **Risco Social Estimado:** (Baixo, Médio, Crítico e justificativa)
2. 🔍 **Fatores Principais:** (Até 3 pontos de vulnerabilidade)
3. 🛠️ **Encaminhamento Recomendado:** (Ações práticas imediatas para o assistente social)

Seja conciso, acolhedor e focado no acolhimento social.
Diálogo/Relato:
"${text}"`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error(data.error?.message || 'Resposta inválida do Gemini');
}
