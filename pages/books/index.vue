<template>
  <h1 class="text-3xl my-4">Books</h1>
  <AddBook @book-added="fetchBooks" />
  <UContainer class="space-y-4">
    <div v-for="decadeGroup in allBooks">
      <UCard>
        <template #header>
          <h2 class="font-bold">
            {{ decadeGroup.decadeStart }} - {{ Number(decadeGroup.decadeEnd) }}
          </h2>
        </template>
        <li v-if="decadeGroup.books.length" v-for="book in decadeGroup.books">
          {{ book.publishYear }} - {{ book.name }}
        </li>
        <p v-else class="italic">No publications</p>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { components } from "#open-fetch-schemas/books";

type Book = components["schemas"]["Book"];
type DecadeGroups = {
  decadeStart: Number;
  decadeEnd: Number;
  books: Book[];
}[];

const allBooks = ref([] as DecadeGroups);
const isBookModalOpen = ref(false);

const fetchBooks = async () => {
  const { $books } = useNuxtApp();
  const books = await $books("/books");

  const sortedBooks = sortBooksByPublishYear(books);
  const groupedBooks = groupBooksByDecade(sortedBooks);
  const consolidatedDecades = consolidateEmptyDecades(groupedBooks);

  allBooks.value = consolidatedDecades;
};

const getDecade = (year: number): number => Math.floor(year / 10) * 10;

// Sort books descending by publishYear
const sortBooksByPublishYear = (books: Book[]) => {
  return books.sort((a, b) => b.publishYear - a.publishYear);
};

const onAddBook = () => {
  isBookModalOpen.value = true;
};

// Group Books by decade
const groupBooksByDecade = (books: Book[]) => {
  const oldestYear = Math.min(...books.map((book) => book.publishYear));
  const newestYear = Math.max(...books.map((book) => book.publishYear));

  // Create all decades from oldest to most recent year
  const decades = Array.from(
    { length: (getDecade(newestYear) - getDecade(oldestYear)) / 10 + 1 },
    (_, i) => getDecade(newestYear) - i * 10
  );

  const getBooksByDecade = (books: Book[], decade: number) => {
    return books.filter((book) => getDecade(book.publishYear) === decade);
  };

  const grouped = decades.map((decade) => {
    const groupedBooks = getBooksByDecade(books, decade);

    return {
      decadeStart: decade,
      decadeEnd: decade + 9,
      books: groupedBooks,
    };
  });

  return grouped;
};

const consolidateEmptyDecades = (grouped: DecadeGroups) => {
  const consolidatedDecades = grouped.reduce((acc, current, index, array) => {
    const last = acc[acc.length - 1];

    if (last && !last.books.length && !current.books.length) {
      // If last and current are empty, extend last decadeGroup, don't add current range
      last.decadeEnd = current.decadeEnd;
    } else {
      return [...acc, current];
    }

    return acc;
  }, [] as DecadeGroups);

  return consolidatedDecades;
};

fetchBooks();
</script>
