/**
 * Tipo padronizado de retorno para server actions.
 *
 * Centraliza o contrato que antes era duplicado em cada arquivo de action.
 * Toda server action que retorna dados ou erros deve usar ActionResult<T>.
 */

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/** Atalho para retorno de erro padronizado. */
export function actionError(message: string): ActionResult<never> {
  return { success: false, error: message }
}

/** Atalho para retorno de sucesso padronizado. */
export function actionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data }
}
