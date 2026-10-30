import { test } from 'node:test'
import assert from 'node:assert/strict'
import { accords, familyOf, splitNotes } from './notes.ts'

test('separa notas escritas a mano', () => {
  assert.deepEqual(splitNotes('Manzana, lichi y rosa.'), ['Manzana', 'lichi', 'rosa'])
  assert.deepEqual(splitNotes('Vainilla, haba tonka, benjuí, mirra, Amberwood y Akigalawood.').length, 6)
})

test('clasifica notas en familias (con y sin acentos)', () => {
  assert.equal(familyOf('Bergamota de Calabria'), 'citrico')
  assert.equal(familyOf('jazmín'), 'floral')
  assert.equal(familyOf('Sándalo'), 'amaderado')
  assert.equal(familyOf('Café arábica'), 'cafe')
  assert.equal(familyOf('haba tonka'), 'dulce')
  assert.equal(familyOf('sal marina'), 'marino')
  assert.equal(familyOf('Amberwood'), 'ambar')
  assert.equal(familyOf('flor de azahar'), 'floral')
  assert.equal(familyOf('Mahonial'), 'floral')
  assert.equal(familyOf('Salvia'), 'aromatico')
  assert.equal(familyOf('chocolate'), 'dulce')
  assert.equal(familyOf('notas elegantes'), 'otra')
  assert.equal(familyOf('lima'), 'citrico')
  assert.equal(familyOf('algo raro'), 'otra')
})

test('acordes: el fondo pesa más y la primera barra es 100', () => {
  const a = accords('Manzana, lichi y rosa.', 'Ciruela y jazmín.', 'Vainilla, musgo y pachulí.')
  assert.equal(a[0].weight, 100)
  assert.equal(a[0].family, 'amaderado') // musgo + pachulí en el fondo
  assert.ok(a.some((x) => x.family === 'frutal'))
})
