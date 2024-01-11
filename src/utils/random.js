import { rando } from '@nastyox/rando.js'

const between = function (from, to) {
    return rando(from, to)
}

const fromArray = function (arr) {
    return rando(arr)
}

const str = function (length, onlyCapital = false) {
    let input = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let output = ''

    if (!onlyCapital) {
        input += 'abcdefghijklmnopqrstuvwxyz'
    }

    while (length > 0) {
        output += rando(input)
        length--
    }

    return output
}

export { between, fromArray, str }
