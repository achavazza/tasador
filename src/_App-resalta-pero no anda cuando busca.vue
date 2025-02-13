<template>
  <div class="max-w-[1400px] mx-auto flex">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <fieldset class="fieldset mb-5">
          <legend class="fieldset-legend">Buscar</legend>
          <input class="input w-full" v-model="searchQuery" placeholder="Buscar trabajo o descripción..." />
        </fieldset>

        <div v-if="loading">Cargando...</div>
        <ul v-else>
          <li v-for="category in filteredCategories" :key="category.category"
            class="collapse collapse-arrow bg-base-200 border border-base-300 mb-5"
            :class="searchQuery ? 'collapse-open' : ''">
            <input type="checkbox" />
            <h3 class="collapse-title">{{ category.category }}</h3>
            <div class="collapse-content pl-10">
              <ul v-if="category.subcategories">
                <li v-for="subcategory in category.subcategories" :key="subcategory.subcategory"
                  class="collapse mt-5 collapse-arrow bg-base-100 border border-base-300"
                  :class="searchQuery ? 'collapse-open' : ''">
                  <input type="checkbox" />
                  <h4 class="collapse-title">{{ subcategory.subcategory }}</h4>
                  <ul class="collapse-content pl-10">
                    <li v-for="job in subcategory.jobs" :key="job.name"
                      class="job-item bg-base-200 border border-base-300 p-5 rounded-xl mb-4">
                      <div @click="toggleJobSelection(job)" class="job-header">
                        <h5 class="font-bold mb-5" v-html="job.highlightedName || job.name"></h5>
                        <p v-html="job.highlightedDescription || job.description"></p>
                        <!--
                          <h5 class="font-bold mb-5">{{ job.name }}</h5>
                          <p>{{ job.description }}</p>
                          -->
                      </div>
                      <div v-if="selectedJob && selectedJob.id === job.id" class="slider-container">
                        <fieldset class="w-full mt-5">
                          <input type="range" :min="job.minHours" :max="job.maxHours" v-model.number="job.selectedHours"
                            class="slider w-full range [--range-fill:0]" />
                          <div class="flex justify-between px-2.5 mt-2 text-xs">
                            <span v-for="value in getSliderValues(job.minHours, job.maxHours)" :key="value">{{ value
                              }}</span>
                          </div>
                          <p class="fieldset-label justify-between">
                            <span>Cantidad Horas {{ job.selectedHours || job.minHours }} hs.</span>
                            <span>(CH)</span>
                          </p>
                        </fieldset>

                        <fieldset class="w-full mt-5">
                          <input type="range" :min="0" :max="Math.ceil(job.maxHours / 2)" v-model.number="job.extraTime"
                            class="slider w-full range [--range-fill:0]" />
                          <div class="flex justify-between px-2.5 mt-2 text-xs">
                            <span v-for="value in getSliderValues(0, Math.ceil(job.maxHours / 2))" :key="value">{{ value }}</span>
                          </div>
                          <p class="fieldset-label justify-between">
                            <span>Tiempo Extra {{ job.extraTime }} hs.</span>
                            <span>(TE)</span>
                          </p>
                        </fieldset>

                        <fieldset class="w-full mt-5">
                          <input type="range" :min="0" :max="20" v-model.number="job.utilityMargin"
                            class="slider w-full range [--range-fill:0]" />
                          <div class="flex justify-between px-2.5 mt-2 text-xs">
                            <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>
                          </div>
                          <p class="fieldset-label justify-between">
                            <span>Margen de utilidad {{ job.utilityMargin }} %</span>
                            <span>(MU)</span>
                          </p>
                        </fieldset>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
              <ul v-else-if="category.jobs">
                <li v-for="job in category.jobs" :key="job.name"
                  class="job-item bg-base-100 border border-base-300 p-5 rounded-xl mb-4">
                  <div @click="toggleJobSelection(job)" class="job-header">
                    <h5 class="font-bold mb-5" v-html="job.highlightedName || job.name"></h5>
                    <p v-html="job.highlightedDescription || job.description"></p>
                    <!--
                      <h5 class="font-bold mb-5">{{ job.name }}</h5>
                      <p>{{ job.description }}</p>
                      -->
                  </div>
                  <div v-if="selectedJob && selectedJob.id === job.id" class="slider-container">
                    <fieldset class="w-full mt-5">
                      <input
                            type="range"
                            :min="job.minHours"
                            :max="job.maxHours"
                            v-model.number="job.selectedHours"
                            class="slider w-full range [--range-fill:0]"
                          />
                      <div class="flex justify-between px-2.5 mt-2 text-xs">
                        <span v-for="value in getSliderValues(job.minHours, job.maxHours)" :key="value">{{ value
                          }}</span>
                      </div>
                      <p class="fieldset-label justify-between">
                        <span>Cantidad Horas {{ job.selectedHours || job.minHours }} hs.</span>
                        <span>(CH)</span>
                      </p>
                    </fieldset>

                    <fieldset class="w-full mt-5">
                      <input type="range" :min="0" :max="Math.ceil(job.maxHours / 2)" v-model.number="job.extraTime"
                        class="slider w-full range [--range-fill:0]" />
                      <div class="flex justify-between px-2.5 mt-2 text-xs">
                        <span v-for="value in getSliderValues(0, Math.ceil(job.maxHours / 2))" :key="value">{{ value }}</span>
                      </div>
                      <p class="fieldset-label justify-between">
                        <span>Tiempo Extra {{ job.extraTime }} hs.</span>
                        <span>(TE)</span>
                      </p>
                    </fieldset>

                    <fieldset class="w-full mt-5">
                      <input type="range" :min="0" :max="20" v-model.number="job.utilityMargin"
                        class="slider w-full range [--range-fill:0]" />
                      <div class="flex justify-between px-2.5 mt-2 text-xs">
                        <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>
                      </div>
                      <p class="fieldset-label justify-between">
                        <span>Margen de utilidad {{ job.utilityMargin }} %</span>
                        <span>(MU)</span>
                      </p>
                    </fieldset>
                  </div>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <div>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Valor Hora</legend>
          <input type="number" class="input w-full" placeholder="Ej. 15000" v-model.number="value.base" />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Valor Extra</legend>
          <input type="number" class="input w-full" placeholder="Ej. 2000" v-model.number="value.extra" />
        </fieldset>

        <fieldset class="fieldset w-full mt-5">
          <legend class="fieldset-legend">Descuento</legend>
          <input type="range" :min="0" :max="50" v-model.number="value.discount"
            class="slider w-full range [--range-fill:0]" />
          <div class="flex justify-between px-2.5 mt-2 text-xs">
            <span>0</span><span>10</span><span>20</span><span>40</span><span>50</span>
          </div>
          <p class="fieldset-label justify-between">
            <span>Descuento Valor {{ value.discount }} %</span>
            <span>(DV)</span>
          </p>
        </fieldset>

        <div class="mt-10">
          <h5 class="font-bold">Total</h5>
          <div class="text-6xl text-right">{{ totalValue }}</div>
        </div>

        <div class="mt-10">
          <div class="p-2 text-center font-bold">(VH x (CH + TE)) + MU + VE = VT</div>

          <!-- name of each tab group should be unique -->
          <div class="tabs tabs-lift">
            <input type="radio" name="my_tabs_3" class="tab" aria-label="VH" checked="checked" />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <h3 class="font-bold mb-2">Valor Hora (VH)</h3>
              <p>Es el valor que tiene tu hora de trabajo.</p>
              <p>Es el valor minimo que se deberia cobrar por el trabajo profesional de diseño. </p>
              <p>El valor de la hora está constituido por un piso minimo sugerido y luego se incrementa a medida que se
                tenga tengas experiencia en la profesión </p>
            </div>

            <input type="radio" name="my_tabs_3" class="tab" aria-label="CH" />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <h3 class="font-bold mb-2">Cantidad de Horas (CH)</h3>
              <p>¡Cuánto tiempo te toma realizar el trabajo? Medilo en horas (no hace falta dividir en mitad y/o
                cuartos).</p>
              <p>Contabilizá cuánto tiempo te lleva en base a tu experiencia, calidad y capacidad profesional.</p>
              <p>La hora es la unidad sobre la que medimos nuestro trabajo, pero no hace falta que nuestros clientes
                tengan conocimiento de ello.</p>
            </div>

            <input type="radio" name="my_tabs_3" class="tab" aria-label="TE" />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <h3 class="font-bold mb-2">Tiempo Extra (TE)</h3>
              <p>Es necesario calcular tiempo extra, ya que siempre aparecen imprevistos (desperfectos técnicos,
                enfermedad, entre Otros).</p>
              <p>Con este Tiempo extra, se obtiene un margen que resguarda la posibilidad de entregar el trabajo en los
                tiempos prometidos.</p>
              <p>Un de tiempo extra es un buen punto para comenzar.</p>
            </div>

            <input type="radio" name="my_tabs_3" class="tab" aria-label="MU" />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <h3 class="font-bold mb-2">Margen Utilidad (MU)</h3>
              <p>Es importante agregar un margen de ganancia gara poder convertir el diseño en una actividad rentable
                (nos permite ahorrar, invertir, prorratear el costo de insumos).</p>
              <p>Toda actividad comercial posee un margen de ganancia que la convierte en fructuosa y útil para cada
                emprendedor.</p>
              <p>Un 20% es un buen punto de partida.</p>
            </div>

            <input type="radio" name="my_tabs_3" class="tab" aria-label="VT" />
            <div class="tab-content bg-base-100 border-base-300 p-6">
              <h3 class="font-bold mb-2">Valor Total (VT)</h3>
              <p>Este es el valor de tu trabajo.</p>
              <p>Este es el valor que indicamos al cliente a la hora de presupuestar.</p>
              <p>La composiciån de este Valor Total no debe ser conocida por el cliente (ninguna actividad comercial Io
                hace, no hace falta un desglose).</p>
              <p>Si es importante que conozco eI alcance del trabajo presupuestado a realizar.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, watchEffect, onMounted } from "vue";
import Fuse from "fuse.js";

const searchQuery = ref("");
const jobs = ref([]);
const value = ref({ base: 5000, extra: 0, discount: 0 });
const loading = ref(true);
const selectedJob = ref(null);


onMounted(async () => {
  try {
    const response = await fetch("/jobs.json");
    const data = await response.json();
    let jobCounter = 1; // Contador para generar IDs si no existen

    jobs.value = data.map(category => {
      // Verifica si la categoría tiene subcategorías
      if (category.subcategories) {
        // Si tiene subcategorías, mapea las subcategorías y sus trabajos
        return {
          ...category,
          subcategories: category.subcategories.map(subcategory => ({
            ...subcategory,
            jobs: subcategory.jobs.map(job => ({
              id: job.id || jobCounter++, // Asigna un ID existente o genera uno nuevo
              ...job,
              selectedHours: job.hours || 0,
              extraTime: 0,
              utilityMargin: 0,
            })),
          })),
        };
      } else if (category.jobs) {
        // Si no tiene subcategorías pero tiene trabajos directamente, mapea los trabajos
        return {
          ...category,
          jobs: category.jobs.map(job => ({
            id: job.id || jobCounter++, // Asigna un ID existente o genera uno nuevo
            ...job,
            selectedHours: job.hours || 0,
            extraTime: 0,
            utilityMargin: 0,
          })),
        };
      } else {
        // Si no tiene ni subcategorías ni trabajos, devuelve la categoría sin cambios
        return category;
      }
    });
  } catch (error) {
    console.error("Error cargando el JSON:", error);
  } finally {
    loading.value = false;
  }
});


const fuse = computed(() => {
  const allJobs = jobs.value.flatMap(category => {
    if (category.subcategories) {
      return category.subcategories.flatMap(subcategory => subcategory.jobs);
    } else if (category.jobs) {
      return category.jobs;
    } else {
      return [];
    }
  });

  return new Fuse(allJobs, {
    keys: ["name", "description"],
    threshold: 0.3,
    ignoreLocation: true,
  });
});

/*
const filteredJobs = computed(() => searchQuery.value
  ? fuse.value.search(searchQuery.value).map(result => result.item)
  : jobs.value.flatMap(category => category.subcategories.flatMap(subcategory => subcategory.jobs))
);*/

const filteredJobs = computed(() => {
  if (!searchQuery.value) {
    return jobs.value.flatMap(category => {
      if (category.subcategories) {
        return category.subcategories.flatMap(subcategory => subcategory.jobs);
      } else if (category.jobs) {
        return category.jobs;
      } else {
        return [];
      }
    });
  }

  const searchResults = fuse.value.search(searchQuery.value);
  return searchResults.map(result => {
    return {
      ...result.item,
      highlightedName: highlightText(result.item.name, searchQuery.value),
      highlightedDescription: highlightText(result.item.description, searchQuery.value),
    };
  });
});
/*
const filteredCategories = computed(() => {
  const jobSet = new Set(filteredJobs.value);
  return jobs.value
    .map(category => ({
      ...category,
      subcategories: category.subcategories
        .map(subcategory => ({
          ...subcategory,
          jobs: subcategory.jobs.filter(job => jobSet.has(job)),
        }))
        .filter(subcategory => subcategory.jobs.length > 0),
    }))
    .filter(category => category.subcategories.length > 0);
});
*/
const filteredCategories = computed(() => {
  if (!searchQuery.value) return jobs.value; // Si no hay búsqueda, muestra todo

  return jobs.value
    .map(category => {
      if (category.subcategories) {
        // Si la categoría tiene subcategorías, filtra las subcategorías y sus trabajos
        const filteredSubcategories = category.subcategories
          .map(subcategory => {
            const searchResults = fuse.value.search(searchQuery.value);
            const filteredJobs = subcategory.jobs
              .filter(job => {
                const match = searchResults.some(result => result.item.id === job.id);
                return match;
              })
              .map(job => {
                // Mantén la referencia al trabajo original
                const originalJob = subcategory.jobs.find(original => original.id === job.id);
                return {
                  ...originalJob, // Usa el trabajo original
                  highlightedName: highlightText(job.name, searchQuery.value),
                  highlightedDescription: highlightText(job.description, searchQuery.value),
                };
              });

            return filteredJobs.length > 0 ? { ...subcategory, jobs: filteredJobs } : null;
          })
          .filter(Boolean); // Elimina subcategorías vacías

        return filteredSubcategories.length > 0 ? { ...category, subcategories: filteredSubcategories } : null;
      } else if (category.jobs) {
        // Si la categoría tiene trabajos directamente, filtra los trabajos
        const searchResults = fuse.value.search(searchQuery.value);
        const filteredJobs = category.jobs
          .filter(job => {
            const match = searchResults.some(result => result.item.id === job.id);
            return match;
          })
          .map(job => {
            // Mantén la referencia al trabajo original
            const originalJob = category.jobs.find(original => original.id === job.id);
            return {
              ...originalJob, // Usa el trabajo original
              highlightedName: highlightText(job.name, searchQuery.value),
              highlightedDescription: highlightText(job.description, searchQuery.value),
            };
          });

        return filteredJobs.length > 0 ? { ...category, jobs: filteredJobs } : null;
      } else {
        // Si no tiene ni subcategorías ni trabajos, devuelve null
        return null;
      }
    })
    .filter(Boolean); // Elimina categorías vacías
});

const totalValue = computed(() => {
  if (!selectedJob.value) return 0;
  const { base, extra, discount } = value.value;
  const { selectedHours, extraTime, utilityMargin } = selectedJob.value;

  if (isNaN(base) || isNaN(extra) || isNaN(discount) || isNaN(selectedHours) || isNaN(extraTime) || isNaN(utilityMargin)) {
    return 0;
  }

  let calc = (((base * (1 - discount / 100)) * (selectedHours + extraTime)) * (1 + utilityMargin / 100) + extra);
  return calc.toFixed(0);
});


function toggleJobSelection(job) {
  if (!job) return;

  // Busca el trabajo original en la lista completa de trabajos
  const originalJob = jobs.value
    .flatMap(category => {
      if (category.subcategories) {
        return category.subcategories.flatMap(subcategory => subcategory.jobs);
      } else if (category.jobs) {
        return category.jobs;
      } else {
        return [];
      }
    })
    .find(original => original.id === job.id);

  // Asigna el trabajo original a selectedJob
  if (selectedJob.value?.id === originalJob.id){ 
    selectedJob.value = null 
  }else {
    console.log(originalJob);
    selectedJob.value = originalJob;
  }
  //selectedJob.value = selectedJob.value?.id === originalJob.id ? null : structuredClone(originalJob);
  //selectedJob.value = selectedJob.value?.id === originalJob.id ? null : reactive({ ...originalJob });
}
/*
function getSliderValues(min, max) {
  return Array.from({ length: 5 }, (_, i) => min + (i * Math.floor((max - min) / 4)));
}*/
function getSliderValues(min, max) {
  const range = max - min;
  if (range <= 5) {
    // Si el rango es muy pequeño, mostramos todos los valores enteros dentro del rango
    return Array.from({ length: range + 1 }, (_, i) => min + i);
  }

  // Calculamos una cantidad razonable de divisiones (máximo 5)
  const steps = Math.min(5, range);
  const stepSize = Math.ceil(range / steps);

  return Array.from({ length: steps + 1 }, (_, i) => min + i * stepSize).filter(v => v <= max);
}

function highlightText(text, query) {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<mark class="bg-yellow-300">$1</mark>');
}
watchEffect(() => {
  if (selectedJob.value) {
    // Forzar la actualización de totalValue cuando cambian las propiedades del trabajo seleccionado
    const { selectedHours, extraTime, utilityMargin } = selectedJob.value;
    console.log("Selected hours updated:", selectedHours);
    console.log("Extra time updated:", extraTime);
    console.log("Utility margin updated:", utilityMargin);
  }
});
watch(filteredCategories, () => {
  if (selectedJob.value) {
    const exists = filteredCategories.value.some(category =>
      category.subcategories.some(subcategory =>
        subcategory.jobs.some(job => job.id === selectedJob.value.id)
      )
    );
    if (!exists) {
      selectedJob.value = null; // Deselecciona si el trabajo ya no está en la lista filtrada
    }
  }
});



</script>
<style>
  p{margin-bottom:0.5rem}
</style>
