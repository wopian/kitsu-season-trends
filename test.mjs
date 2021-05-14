import rwscore from 'reddit-wilsonscore'
import wrate from 'wilson-rate'
import rscore from 'rating-score'


const rf = {
  "2": 6, //
  "3": 0, //
  "4": 0, //
  "5": 0,
  "6": 2,
  "7": 0,
  "8": 12,
  "9": 0, //
  "10": 4, //
  "11": 1, //
  "12": 8, //
  "13": 3,
  "14": 39,
  "15": 16,
  "16": 26,
  "17": 16, //
  "18": 16, //
  "19": 4, //
  "20": 76 //
}


/*
const rf = {
  "2": 0, //
  "3": 0, //
  "4": 0, //
  "5": 0,
  "6": 0,
  "7": 0,
  "8": 0,
  "9": 0, //
  "10": 0, //
  "11": 0, //
  "12": 1, //
  "13": 0,
  "14": 1,
  "15": 0,
  "16": 0,
  "17": 0, //
  "18": 0, //
  "19": 0, //
  "20": 5 //
}
*/

const pos = rf['20'] + rf['19'] + rf['18'] + rf['17'] + rf['16'] + rf['15'] + rf['14'] + rf['13'] + rf['12'] + rf['11']
const neg = rf['10'] + rf['9']  + rf['8']  + rf['7']  + rf['6']  + rf['5']  + rf['4']  + rf['3']  + rf['2']
const stars = wrate.stars( // 5 to 1 star
  rf['20'] + rf['19'] + rf['18'] + rf['17'],
  rf['16'] + rf['15'] + rf['14'] + rf['13'],
  rf['12'] + rf['11'] + rf['10'] + rf['9'],
  rf['8']  + rf['7']  + rf['6'] + rf['5'],
  rf['4']  + rf['3']  + rf['2']
)

console.log(stars)


console.log(rwscore(stars.upvotes, stars.downvotes, 1.96).toFixed(4) * 100)

console.log(wrate.average(stars.upvotes, stars.downvotes).toFixed(4) * 100)
console.log(wrate.wilson(stars.upvotes, stars.downvotes, 1.96).toFixed(4) * 100) // <-- use me!
console.log(wrate.mid(stars.upvotes, stars.downvotes).toFixed(4) * 100)


//console.log(rwscore(pos, neg))

//console.log(wrate.average(pos, neg))
//console.log(wrate.wilson(pos, neg))
//console.log(wrate.mid(pos, neg))