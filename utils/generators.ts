export function generateRandomData(first = 'AutoCompany', second = 'Alias') {
  const name = `${first}-${Date.now()}`
  const alias = `${second}-${Math.floor(Math.random() * 10000)}`
  return { name, alias }
}

export function generateRandomNumber() {
  const number = Math.floor(Math.random() * 100000)
  return number
}
