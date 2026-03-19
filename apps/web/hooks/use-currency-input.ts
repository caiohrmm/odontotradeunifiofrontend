import { useState } from "react"

function digitsToFormatted(digits: string): string {
  if (!digits) return ""
  const cents = parseInt(digits, 10)
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function valueToDigits(value: number): string {
  return Math.round(value * 100).toString()
}

/**
 * Mask for BRL currency inputs.
 * - Shows "1.234,56" format as the user types
 * - Digits are stored as cents internally
 * - `numericValue` returns the parsed float (e.g. 1234.56), or undefined if empty
 */
export function useCurrencyInput(initialValue?: number) {
  const [digits, setDigits] = useState<string>(
    initialValue != null ? valueToDigits(initialValue) : ""
  )

  const formattedValue = digitsToFormatted(digits)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "")
    // Drop leading zeros except when empty
    setDigits(raw ? String(parseInt(raw, 10)) : "")
  }

  const numericValue = digits ? parseInt(digits, 10) / 100 : undefined

  return { formattedValue, handleChange, numericValue }
}
