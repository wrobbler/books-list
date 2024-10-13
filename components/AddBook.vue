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
          <UInput v-model="formData.publishYear" />
        </UFormGroup>
        <UFormGroup required label="Genre" name="genre">
          <UInput v-model="formData.category" />
        </UFormGroup>
        <UFormGroup label="Ratings" name="ratings">
          <UInput v-model="formData.ratings" />
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
  ratings: "[]",
});

const clearFormData = () => {
  formData.author = undefined;
  formData.name = undefined;
  formData.publishYear = undefined;
  formData.category = undefined;
  formData.ratings = "[]";
};

const onSubmit = async (e: FormSubmitEvent<Schema>) => {
  console.log(e.data);

  // TODO parse ratings data

  try {
    const { data, error: fetchError } = await useBooks("/books", {
      method: "POST",
      body: e.data,
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
