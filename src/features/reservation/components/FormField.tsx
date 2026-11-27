import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}

/** 라벨, 입력, 필드 오류 메시지 묶음. 오류는 입력 아래에 표시한다. */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <small>{hint}</small>}
      {error && (
        <small className="field-error" id={`${htmlFor}-error`} role="alert">
          {error}
        </small>
      )}
    </div>
  )
}
