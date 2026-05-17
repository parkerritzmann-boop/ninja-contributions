import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

const rows = 7
const cols = 53
const today = new Date('2026-05-17T12:00:00-07:00')
const start = new Date(today)
start.setDate(today.getDate() - (cols * rows - 1))

const letterMap = {
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['11111', '00010', '00010', '00010', '10010', '10010', '01100'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
}

const word = ['N', 'I', 'N', 'J', 'A']
const startCol = 13
const letterWidth = 5
const gap = 2
const ninjaCells = new Set()

word.forEach((letter, index) => {
  const origin = startCol + index * (letterWidth + gap)
  letterMap[letter].forEach((line, row) => {
    ;[...line].forEach((value, offset) => {
      if (value === '1') {
        ninjaCells.add(`${row}:${origin + offset}`)
      }
    })
  })
})

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function runGit(args, env = {}) {
  execFileSync('git', args, {
    stdio: 'pipe',
    env: { ...process.env, ...env },
  })
}

for (let col = 0; col < cols; col += 1) {
  for (let row = 0; row < rows; row += 1) {
    if (ninjaCells.has(`${row}:${col}`)) {
      continue
    }

    const date = new Date(start)
    date.setDate(start.getDate() + col * rows + row)
    if (date > today) {
      continue
    }

    const dateLabel = isoDate(date)
    for (let commit = 1; commit <= 8; commit += 1) {
      appendFileSync('ninja-log.txt', `${dateLabel} ninja background deepen ${commit}\n`)
      runGit(['add', 'ninja-log.txt'])
      runGit(['commit', '-m', `ninja background ${dateLabel} ${commit}`], {
        GIT_AUTHOR_DATE: `${dateLabel}T13:${String(commit).padStart(2, '0')}:00-07:00`,
        GIT_COMMITTER_DATE: `${dateLabel}T13:${String(commit).padStart(2, '0')}:00-07:00`,
      })
    }
  }
}
