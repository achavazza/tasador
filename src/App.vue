<template>
  <div class="max-w-[1400px] mx-5 xl:mx-auto  flex">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <fieldset class="fieldset mb-5">
          <legend class="fieldset-legend">Buscar</legend>
          <div class="join">
            <input class="join-item input w-full" v-model="jobStore.searchQuery" placeholder="Buscar trabajo o descripción..." />
            <button class="join-item btn btn-neutral" @click="jobStore.resetSearch">Reset</button>
          </div>
        </fieldset>

        <div class="scroll">
        <div v-if="jobStore.loading">Cargando...</div>
        <ul v-else>
          <li v-for="category in jobStore.filteredCategories" :key="category.category"
            class="collapse collapse-arrow bg-base-200 border border-base-300 mb-5">
            <input type="checkbox" :checked="jobStore.searchQuery ? 'checked' : false" />
            <h3 class="collapse-title">{{ category.category }}</h3>
            <div class="collapse-content pl-10">
              <ul v-if="category.subcategories">
                <li v-for="subcategory in category.subcategories" :key="subcategory.subcategory"
                  class="collapse mb-2 last:mb-0 collapse-arrow bg-base-100 border border-base-300">
                  <input type="checkbox" :checked="jobStore.searchQuery ? 'checked' : false" />
                  <h4 class="collapse-title">{{ subcategory.subcategory }}</h4>
                  <ul class="collapse-content pl-10">
                    <li v-for="job in subcategory.jobs" :key="job.name"
                      class="job-item bg-base-200 border border-base-300 p-5 rounded-xl mb-2 last:mb-0">
                      <div @click="jobStore.toggleJobSelection(job)" class="job-header">
                        <h5 class="font-bold mb-5">{{ job.name }}</h5>
                        <p>{{ job.description }}</p>
                      </div>
                      <div v-if="jobStore.selectedJob && jobStore.selectedJob.id === job.id" class="slider-container">
                        <fieldset class="w-full mt-5">
                          <input type="range" :min="job.minHours" :max="job.maxHours" v-model.number="job.selectedHours"
                            class="slider w-full range range-primary [--range-fill:0]" />
                          <div class="flex justify-between px-2.5 mt-2 text-xs">
                            <span v-for="value in jobStore.getSliderValues(job.minHours, job.maxHours)" :key="value">{{ value }}</span>
                          </div>
                          <p class="fieldset-label justify-between">
                            <span>Cantidad Horas {{ job.selectedHours || job.minHours }} hs.</span>
                            <span>(CH)</span>
                          </p>
                        </fieldset>

                        <fieldset class="w-full mt-5">
                          <input type="range" :min="0" :max="Math.ceil(job.maxHours / 2)" v-model.number="job.extraTime"
                            class="slider w-full range range-secondary [--range-fill:0]" />
                          <div class="flex justify-between px-2.5 mt-2 text-xs">
                            <span v-for="value in jobStore.getSliderValues(0, Math.ceil(job.maxHours / 2))" :key="value">{{ value }}</span>
                          </div>
                          <p class="fieldset-label justify-between">
                            <span>Tiempo Extra {{ job.extraTime }} hs.</span>
                            <span>(TE)</span>
                          </p>
                        </fieldset>

                        <fieldset class="w-full mt-5">
                          <input type="range" :min="0" :max="20" v-model.number="job.utilityMargin"
                            class="slider w-full range range-secondary [--range-fill:0]" />
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
                  <div @click="jobStore.toggleJobSelection(job)" class="job-header">
                    <h5 class="font-bold mb-5">{{ job.name }}</h5>
                    <p>{{ job.description }}</p>
                  </div>
                  <div v-if="jobStore.selectedJob && jobStore.selectedJob.id === job.id" class="slider-container">
                    <fieldset class="w-full mt-5">
                      <input type="range" :min="job.minHours" :max="job.maxHours" v-model.number="job.selectedHours"
                        class="slider w-full range range-primary [--range-fill:0]" />
                      <div class="flex justify-between px-2.5 mt-2 text-xs">
                        <span v-for="value in jobStore.getSliderValues(job.minHours, job.maxHours)" :key="value">{{ value }}</span>
                      </div>
                      <p class="fieldset-label justify-between">
                        <span>Cantidad Horas {{ job.selectedHours || job.minHours }} hs.</span>
                        <span>(CH)</span>
                      </p>
                    </fieldset>

                    <fieldset class="w-full mt-5">
                      <input type="range" :min="0" :max="Math.ceil(job.maxHours / 2)" v-model.number="job.extraTime"
                        class="slider w-full range range-secondary [--range-fill:0]" />
                      <div class="flex justify-between px-2.5 mt-2 text-xs">
                        <span v-for="value in jobStore.getSliderValues(0, Math.ceil(job.maxHours / 2))" :key="value">{{ value }}</span>
                      </div>
                      <p class="fieldset-label justify-between">
                        <span>Tiempo Extra {{ job.extraTime }} hs.</span>
                        <span>(TE)</span>
                      </p>
                    </fieldset>

                    <fieldset class="w-full mt-5">
                      <input type="range" :min="0" :max="20" v-model.number="job.utilityMargin"
                        class="slider w-full range range-secondary [--range-fill:0]" />
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
      </div>

      <div>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Valor Hora</legend>
          <input type="number" class="input w-full" placeholder="Ej. 15000" v-model.number="jobStore.value.base" />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Valor Extra</legend>
          <input type="number" class="input w-full" placeholder="Ej. 2000" v-model.number="jobStore.value.extra" />
        </fieldset>

        <fieldset class="fieldset w-full mt-5">
          <legend class="fieldset-legend">Descuento</legend>
          <input type="range" :min="0" :max="50" v-model.number="jobStore.value.discount"
            class="slider w-full range range-secondary  [--range-fill:0]" />
          <div class="flex justify-between px-2.5 mt-2 text-xs">
            <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
            <span>25</span>
            <span>30</span>
            <span>35</span>
            <span>40</span>
            <span>45</span>
            <span>50</span>
          </div>
          <p class="fieldset-label justify-between">
            <span>Descuento Valor {{ jobStore.value.discount }} %</span>
            <span>(DV)</span>
          </p>
        </fieldset>

        <div class="mt-10 card  bg-base-200">
        <div class="card-body">
          <h5 class="font-bold">Total</h5>
          <VueNumberFormat
            class="text-6xl text-right text-primary border-none"
            style="outline: 0"
            v-model:value="jobStore.totalValue"
            readonly
            :options="{ precision: 2, prefix: '', decimal: ',', thousand: '.', acceptNegative: false, isInteger: true  }"
          ></VueNumberFormat>
          <!--
            <div class="text-6xl text-right text-primary">{{ jobStore.totalValue }}</div>
            -->
        </div>
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
import { useJobStore } from "@/stores/jobStore";
import { onMounted } from "vue";
import VueNumberFormat from 'vue-number-format'

const jobStore = useJobStore();

onMounted(() => {
  jobStore.fetchJobs();
});
</script>