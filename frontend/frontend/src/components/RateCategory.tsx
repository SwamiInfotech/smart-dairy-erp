import type { RateCategoryResponse } from '../types/api'

type RateCategoryProps = {
  categories: RateCategoryResponse[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function RateCategory({
  categories,
  value,
  onChange,
  required = true,
  label = 'Rate Category',
  placeholder = 'Select rate category',
  disabled = false,
}: RateCategoryProps) {
  return (
    <label className="milk-rate-field">
      <span>{label}</span>
      <select required={required} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {categories.map((item) => (
          <option key={item.uuid} value={item.uuid}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  )
}
