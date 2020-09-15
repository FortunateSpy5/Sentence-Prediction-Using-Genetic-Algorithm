let sliders = document.querySelectorAll(".slider");
let values = document.querySelectorAll(".value");
let start = document.querySelector("#start");
let reset = document.querySelector("#reset");
let generation = document.querySelector("#generation");
let ul = document.querySelector("ul");
let input = document.querySelector(".input-area");
let stop_process = false;

// Input sliders
values[0].innerHTML = sliders[0].value * 10;
sliders[0].oninput = function () {
  values[0].innerHTML = sliders[0].value * 10;
};

values[1].innerHTML = sliders[1].value;
sliders[1].oninput = function () {
  values[1].innerHTML = sliders[1].value;
};

values[2].innerHTML = sliders[2].value;
sliders[2].oninput = function () {
  values[2].innerHTML = sliders[2].value;
};








function getTotal(weights) {
  var total = weights.__weighted_total

  if (total != null) {
    return total
  }

  function wrap(arr, fn) {
    return function () {
      arr.__weighted_total = null
      fn.apply(arr, arguments)
    }
  }

  if (total === undefined) {
    ;
    ['pop', 'push', 'shift', 'unshift', 'splice'].forEach(function (key) {
      weights[key] = wrap(weights, weights[key])
    })
  }

  total = weights.__weighted_total = weights.reduce(function (prev, curr) {
    return prev + curr
  }, 0)

  return total
}

function _selectArr(set, weights, options) {
  if (typeof options.rand !== 'function') {
    options.rand = Math.random
  }

  if (set.length !== weights.length) {
    throw new TypeError('Different number of options & weights.')
  }

  var total = options.total || (options.normal ? 1 : getTotal(weights)),
    key = options.rand() * total,
    index = 0

  for (; index < weights.length; index++) {
    key -= weights[index]

    if (key < 0) {
      return set[index]
    }
  }

  throw new RangeError('All weights do not add up to >= 1 as expected.')
}

function _selectObj(obj, options) {
  var keys = Object.keys(obj),
    values = keys.map(function (key) {
      return obj[key]
    })

  return _selectArr(keys, values, options)
}

function select(set, weights, options) {
  if (typeof options === 'function') {
    options = {
      rand: options
    }
  }

  if (options == null) {
    options = {}
  }

  if (Array.isArray(set)) {
    if (weights == null) {
      weights = set.map(function () {
        return 1
      })
    }

    if (Array.isArray(weights)) {
      if (set.length === weights.length) {
        return _selectArr(set, weights, options)
      }

      throw new TypeError('Set and Weights are different sizes.')
    }

    throw new TypeError('Set is an Array, and Weights is not.')
  }

  if (typeof set === 'object') {
    return _selectObj(set, weights || options)
  }

  throw new TypeError('Set is not an Object, nor is it an Array.')
}









function get_random_string(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\"\'&:;!.,-' + ' '.repeat(Math.floor(length / 5));
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//DNA

class DNA {
  constructor() {
    this.genes = [];
    this.length = null;
    this.fitness = null;
  }

  set_random_genes(length) {
    this.genes = get_random_string(length);
    this.length = length;
  }

  calculate_fitness(sentence) {
    let count = 0;
    for (let i = 0; i < this.length; i++) {
      if (this.genes.charAt(i) == sentence[i]) {
        count += 1;
      }
    }
    this.fitness = Math.pow(count / sentence.length, 2);
  }
}

// Population
class populationObj {
  constructor() {
    this.sentence = null;
    this.length = null;
    this.population = [];
    this.fitness = [];
    this.rank = [];
    this.population_size = 1000;
    this.elite = 0.2;
    this.mutation_rate = 0.05;
    this.generation_count = 0;
    this.max_generation = 10000;
  }

  generate_initial_population() {
    for (let i = 0; i < this.population_size; i++) {
      let dna = new DNA();
      dna.set_random_genes(this.length);
      this.population.push(dna);
    }
  }

  calculate_fitness() {
    this.fitness = [];
    for (let i = 0; i < this.population_size; i++) {
      this.population[i].calculate_fitness(this.sentence);
      this.fitness.push(this.population[i].fitness);
    }
  }

  sort_population() {
    this.rank = [];
    for (let i = 0; i < this.population_size; i++) {
      this.rank.push(i);
    }
    for (let i = 0; i < this.population_size - 1; i++) {
      let count = 0;
      for (let j = 0; j < this.population_size - i - 1; j++) {
        if (this.fitness[this.rank[j]] < this.fitness[this.rank[j + 1]]) {
          [this.rank[j], this.rank[j + 1]] = [this.rank[j + 1], this.rank[j]];
          count += 1
        }
      }
      if (count === 0) {
        break;
      }
    }
  }

  generate_new_population() {
    let new_population = [];
    let index = 0;
    while (index < this.elite * this.population_size) {
      new_population.push(this.population[this.rank[index]]);
      index += 1;
    }
    while (index < this.population_size) {
      new_population.push(this.random_crossover());
      index += 1;
    }
    this.population = new_population;
  }

  random_crossover() {
    let dna_a = select(this.population, this.fitness);
    let dna_b = select(this.population, this.fitness);
    while (dna_a == dna_b) {
      dna_b = select(this.population, this.fitness);
    }
    let index = 0;
    let dna = new DNA();
    while (index < this.length) {
      if (Math.random() < this.mutation_rate) {
        dna.genes += get_random_string(1);
        index += 1;
      }
      else {
        if (Math.random() < 0.5) {
          dna.genes += dna_a.genes.charAt(index);
          index += 1;
        }
        else {
          dna.genes += dna_b.genes.charAt(index);
          index += 1;
        }
      }
    }
    dna.length = this.length;
    return dna;
  }
}

function geneticAlgorithm(sentence) {
  let obj = new populationObj();
  obj.sentence = sentence;
  obj.length = obj.sentence.length;
  updateParameters(obj);
  obj.generate_initial_population();
  ga_iteration(obj);
}

function ga_iteration(obj) {
  console.log(stop_process);
  obj.calculate_fitness();
  obj.sort_population();
  update(obj);
  if (stop_process == true) {
    ul.innerHTML = "";
    generation.innerHTML = "0";
    return;
  }
  if (obj.fitness[obj.rank[0]] == 1 || obj.generation_count >= obj.max_generation) {
    return;
  }
  obj.generation_count += 1;
  obj.generate_new_population();
  setTimeout(function () {
    ga_iteration(obj);
  }, 100)
}

function updateParameters(obj) {
  obj.population_size = sliders[0].value * 10;
  obj.elite = sliders[1].value / 100;
  obj.mutation_rate = sliders[2].value / 100;
}

function update(obj) {
  generation.innerHTML = "" + obj.generation_count;
  ul.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    ul.innerHTML += "<li>" + obj.population[obj.rank[i]].genes + "</li>";
  }
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

// Start button
start.addEventListener("click", function () {
  stop_process = false;
  if (input.value != "") {
    geneticAlgorithm(input.value);
  }
});

// Reset button
reset.addEventListener("click", function () {
  stop_process = true;
});