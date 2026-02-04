// Favorites Module - User-saved currency pairs
const Favorites = {
  pairs: [],
  
  init() {
    this.load();
  },
  
  load() {
    this.pairs = Storage.loadFavorites();
    console.log('Favorites loaded:', this.pairs.length);
  },
  
  save() {
    Storage.saveFavorites(this.pairs);
  },
  
  add(from, to) {
    const pair = `${from}/${to}`;
    if (!this.pairs.includes(pair)) {
      this.pairs.push(pair);
      this.save();
      return true;
    }
    return false;
  },
  
  remove(from, to) {
    const pair = `${from}/${to}`;
    const index = this.pairs.indexOf(pair);
    if (index > -1) {
      this.pairs.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  },
  
  has(from, to) {
    const pair = `${from}/${to}`;
    return this.pairs.includes(pair);
  },
  
  getAll() {
    return this.pairs.map(pair => {
      const [from, to] = pair.split('/');
      return { from, to };
    });
  },
  
  clear() {
    this.pairs = [];
    this.save();
  }
};

Favorites.init();
