'use client'

const EXAMPLE_CHIPS = [
  {
    label: 'Family',
    text: "I have a family of 4 including 2 young kids and a golden retriever. We do weekend road trips, school runs, and occasional hiking. Safety, cargo space, and an easy-to-clean interior are top priorities. Budget around $40,000.",
  },
  {
    label: 'Daily Commuter',
    text: "I commute 35 miles each way on the highway every day. Fuel efficiency, comfortable seats, and low long-term running costs are what matter most. My budget is around $30,000 and I'd prefer something reliable.",
  },
  {
    label: 'Adventure',
    text: "I love camping and hiking on weekends and need a car that handles unpaved forest roads. I need cargo space for gear, solid all-weather capability, and enough ground clearance for light off-road use. Budget up to $50,000.",
  },
]

interface LifestyleTextBoxProps {
  value: string
  onChange: (text: string) => void
}

export function LifestyleTextBox({ value, onChange }: LifestyleTextBoxProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-0.5">
          Describe Your Situation
        </h3>
        <p className="text-xs text-gray-400">
          What does your daily life look like? The more context, the better the match.
        </p>
      </div>

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. I have a family of 4 and a dog. We do weekend trips and need cargo space. Safety is my top priority and my budget is around $40,000..."
        rows={7}
        className="w-full flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 leading-relaxed"
      />

      <div>
        <p className="text-xs text-gray-400 mb-2">Quick examples — click to fill:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_CHIPS.map(chip => (
            <button
              key={chip.label}
              onClick={() => onChange(chip.text)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 transition-colors"
            >
              {chip.label} →
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
