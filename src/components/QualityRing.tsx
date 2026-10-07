interface QualityRingProps {
  score: number
  size?: 'small' | 'large'
}

export function QualityRing({ score, size = 'small' }: QualityRingProps) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`quality-ring quality-ring--${size}`} aria-label={`Quality score ${score} out of 100`}>
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="quality-ring__track" cx="22" cy="22" r={radius} />
        <circle
          className="quality-ring__value"
          cx="22"
          cy="22"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span>{score}</span>
    </div>
  )
}
