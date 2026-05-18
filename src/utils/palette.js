// Static class lookups so Tailwind's JIT can see every class name.
export const palette = {
  coral: {
    soft:   'bg-coral-50',
    ring:   'ring-coral-200',
    border: 'border-coral-200',
    text:   'text-coral-700',
    dot:    'bg-coral-500',
    btn:    'bg-coral-500 hover:bg-coral-700 text-white',
    chip:   'bg-coral-50 text-coral-700 border-coral-200'
  },
  sage: {
    soft:   'bg-sage-50',
    ring:   'ring-sage-200',
    border: 'border-sage-200',
    text:   'text-sage-700',
    dot:    'bg-sage-500',
    btn:    'bg-sage-500 hover:bg-sage-700 text-white',
    chip:   'bg-sage-50 text-sage-700 border-sage-200'
  },
  plum: {
    soft:   'bg-plum-50',
    ring:   'ring-plum-200',
    border: 'border-plum-200',
    text:   'text-plum-700',
    dot:    'bg-plum-500',
    btn:    'bg-plum-500 hover:bg-plum-700 text-white',
    chip:   'bg-plum-50 text-plum-700 border-plum-200'
  },
  butter: {
    soft:   'bg-butter-50',
    ring:   'ring-butter-200',
    border: 'border-butter-200',
    text:   'text-butter-700',
    dot:    'bg-butter-500',
    btn:    'bg-butter-500 hover:bg-butter-700 text-white',
    chip:   'bg-butter-50 text-butter-700 border-butter-200'
  }
}

export const KID_COLORS = ['coral', 'sage', 'plum', 'butter']

export const categoryMeta = {
  chore:      { label: 'Chore',      icon: 'CHORE' },
  homeschool: { label: 'Homeschool', icon: 'STUDY' },
  routine:    { label: 'Routine',    icon: 'ROUTINE' },
  reminder:   { label: 'Reminder',   icon: 'NOTE' }
}
