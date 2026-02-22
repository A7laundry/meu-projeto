// Funções utilitárias puras para geração de mensagens de campanha.
// Este arquivo NÃO é 'use server' — pode ser importado em componentes client.

export function buildBirthdayMessage(name: string): string {
  const first = name.split(' ')[0]
  return `Olá ${first}! 🎂\n\nHoje é um dia especial e queríamos ser os primeiros a te desejar um *Feliz Aniversário*! 🎉\n\nQue este dia seja repleto de alegria e realizações! 💛\n\nCom carinho,\nSua Lavanderia`
}

export function buildDormancyMessage(name: string, days: number): string {
  const first = name.split(' ')[0]
  if (days >= 90) {
    return `Olá ${first}! Saudades! 💛\n\nFaz *${days} dias* que não cuidamos das suas roupas e sentimos muito sua falta!\n\nQue tal darmos um novo começo? Temos condições especiais para quem retorna. ✨`
  }
  if (days >= 60) {
    return `Oi ${first}! 😊\n\nPercebemos que faz *${days} dias* desde sua última visita — ficamos com saudade!\n\nTemos novidades esperando por você. Venha nos visitar! 🌟`
  }
  return `Olá ${first}! 👋\n\nFaz *${days} dias* que não te vemos por aqui e sentimos sua falta!\n\nQue tal trazer suas peças esta semana? Será um prazer cuidar delas para você. ✨`
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '')
  const number = clean.startsWith('55') ? clean : `55${clean}`
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
