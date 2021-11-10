
module.exports = {
  sanatizeArmyBook: (armyBook) => {
    delete armyBook.id;
    delete armyBook.user_id;
    return armyBook
  },
  sanatizeArmyBooks: (armyBooks) => {

  },
}
