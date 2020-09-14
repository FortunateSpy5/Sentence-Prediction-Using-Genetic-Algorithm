from string import ascii_letters, digits
from random import choices, randint, random


class DNA:
    def __init__(self):
        self.genes = []
        self.length = None
        self.valid = list(ascii_letters + digits + "\"\'&:;!., ")
        self.fitness = None

    def set_genes(self, genes, length):
        self.genes = genes
        self.length = length

    def set_random_genes(self, length):
        self.genes = choices(self.valid + [" "] * (length // 5), k=length)
        self.length = length

    def calculate_fitness(self, sentence):
        count = 0
        for i in range(self.length):
            if self.genes[i] == sentence[i]:
                count += 1
        self.fitness = count / self.length


class Population:
    def __init__(self):
        self.sentence = None
        self.length = None
        self.population = []
        self.fitness = []
        self.rank = []
        self.population_size = 1000
        self.elite = 0.2
        self.mutation_rate = 0.05
        self.generation_count = 0
        self.max_generation = 100000

    def genetic_algorithm(self, sentence):
        self.sentence = sentence
        self.length = len(sentence)
        self.generate_initial_population()
        while self.generation_count < self.max_generation:
            self.calculate_fitness()
            self.rank = list(range(self.population_size))
            self.sort_population()
            print("\nGeneration:", self.generation_count)
            print(f"Best of generation: {''.join(self.population[self.rank[0]].genes)}\nFitness: {self.fitness[self.rank[0]]}")
            if self.fitness[self.rank[0]] == 1:
                break
            self.generation_count += 1
            self.generate_new_population()

    def generate_initial_population(self):
        for i in range(self.population_size):
            dna = DNA()
            dna.set_random_genes(self.length)
            self.population.append(dna)

    def calculate_fitness(self):
        self.fitness = []
        for i in range(self.population_size):
            self.population[i].calculate_fitness(self.sentence)
            self.fitness.append(self.population[i].fitness)

    def sort_population(self):
        self.rank.sort(key=lambda x: self.fitness[x], reverse=True)

    def generate_new_population(self):
        new_population = []
        index = 0
        while index < self.elite * self.population_size:
            new_population.append(self.population[self.rank[index]])
            index += 1
        while index < self.population_size:
            new_population.append(self.random_crossover())
            index += 1
        self.population = new_population

    def random_crossover_split(self):
        dna_a = choices(self.population, self.fitness, k=1)[0]
        dna_b = choices(self.population, self.fitness, k=1)[0]
        while dna_a == dna_b:
            dna_b = choices(self.population, self.fitness, k=1)[0]
        split = randint(0, self.length - 1)
        index = 0
        dna = DNA()
        while index < self.length:
            if random() < self.mutation_rate:
                dna.genes.append(choices(dna_a.valid + [" "] * (self.length // 5), k=1)[0])
                index += 1
            else:
                if index < split:
                    dna.genes.append(dna_a.genes[index])
                    index += 1
                else:
                    dna.genes.append(dna_b.genes[index])
                    index += 1
        dna.length = self.length
        return dna

    def random_crossover(self):
        dna_a = choices(self.population, self.fitness, k=1)[0]
        dna_b = choices(self.population, self.fitness, k=1)[0]
        while dna_a == dna_b:
            dna_b = choices(self.population, self.fitness, k=1)[0]
        index = 0
        dna = DNA()
        while index < self.length:
            if random() < self.mutation_rate:
                dna.genes.append(choices(dna_a.valid + [" "] * (self.length // 5), k=1)[0])
                index += 1
            else:
                if random() < 0.5:
                    dna.genes.append(dna_a.genes[index])
                    index += 1
                else:
                    dna.genes.append(dna_b.genes[index])
                    index += 1
        dna.length = self.length
        return dna


if __name__ == '__main__':
    obj = Population()
    obj.genetic_algorithm(input("Enter a sentence: "))
