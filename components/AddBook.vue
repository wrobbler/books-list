<template>
  <UButton class="mb-4" label="Add Book" @click="isOpen = true" />
  <UModal v-model="isOpen">
    <UCard>
      <template #header>Add Book</template>
      <UForm :schema="schema" :state="formData" @submit="onSubmit">
        <UFormGroup required label="Title" name="name">
          <UInput v-model="formData.name" />
        </UFormGroup>
        <UFormGroup required label="Author" name="author">
          <UInput v-model="formData.author" />
        </UFormGroup>
        <UFormGroup required label="Published Year" name="publishedYear">
          <UInput v-model.number="formData.publishYear" />
        </UFormGroup>
        <UFormGroup required label="Genre" name="genre">
          <UInput v-model="formData.category" />
        </UFormGroup>

        <UFormGroup label="Ratings" name="ratings">
          <div v-for="(rating, index) in formData.ratings" :key="index">
            <UInput
              v-model="rating.source"
              placeholder="Source (e.g., Goodreads)"
              label="Source"
            />
            <UInput
              v-model.number="rating.value"
              type="number"
              placeholder="Rating Value (0-5)"
              label="Rating"
              min="0"
              max="5"
            />
            <UButton
              type="button"
              label="Remove"
              @click="removeRating(index)"
            />
          </div>
          <UButton type="button" label="Add Rating" @click="addRating" />
        </UFormGroup>

        <UButton class="mt-4" type="submit" label="Add Book" />
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";
import { number, object, string, type InferType } from "yup";
import type { components } from "#open-fetch-schemas/books";

type Book = components["schemas"]["Book"];

const emit = defineEmits<{
  (e: "book-added"): void;
}>();

const schema = object({
  name: string().required("Required"),
  author: string().required("Required"),
  publishYear: number().required("Required"),
  category: string().required("Required"),
});

type Schema = InferType<typeof schema>;
const isOpen = ref(false);

const formData = reactive({
  name: undefined,
  author: undefined,
  publishYear: undefined,
  category: undefined,
  ratings: [{ source: "", value: null }],
});

const clearFormData = () => {
  formData.author = undefined;
  formData.name = undefined;
  formData.publishYear = undefined;
  formData.category = undefined;
  formData.ratings = [{ source: "", value: null }];
};

const addRating = () => {
  formData.ratings.push({ source: "", value: null });
};

const removeRating = (index: number) => {
  if (formData.ratings.length > 1) {
    formData.ratings.splice(index, 1);
  }
};

const onSubmit = async (e: FormSubmitEvent<Schema>) => {
  const { ratings, ...rest } = e.data;

  const cleanRatings = (ratings) => {
    return ratings.filter((rating) => {
      return !!(rating.source && rating.value);
    });
  };

  const formattedData = {
    ...rest,
    ratings: cleanRatings(ratings),
  };

  try {
    const { data, error: fetchError } = await useBooks("/books", {
      method: "POST",
      body: formattedData,
    });

    if (fetchError.value) {
      console.log(fetchError.value);
    } else {
      isOpen.value = false;
      clearFormData();
      emit("book-added");
    }
  } catch (error) {
    console.log(error);
  }
};
</script>
