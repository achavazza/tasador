import { defineStore } from "pinia";
import { ref, computed } from "vue";
import Fuse from "fuse.js";

export const useJobStore = defineStore("jobStore", () => {
  // Estado
  const searchQuery = ref("");
  const jobs = ref([]);
  const value = ref({ base: 5000, extra: 0, discount: 0 });
  const loading = ref(true);
  const selectedJob = ref(null);
  const selectedJobId = ref(null);

  // Acciones
  const fetchJobs = async () => {
    try {
      const response = await fetch("/jobs.json");
      const data = await response.json();
      let jobCounter = 1;

      jobs.value = data.map(category => {
        if (category.subcategories) {
          return {
            ...category,
            subcategories: category.subcategories.map(subcategory => ({
              ...subcategory,
              jobs: subcategory.jobs.map(job => ({
                id: job.id || jobCounter++,
                ...job,
                selectedHours: job.hours || 0,
                extraTime: 0,
                utilityMargin: 0,
                isCollapsed: false, // Track collapse state
              })),
            })),
          };
        } else if (category.jobs) {
          return {
            ...category,
            jobs: category.jobs.map(job => ({
              id: job.id || jobCounter++,
              ...job,
              selectedHours: job.hours || 0,
              extraTime: 0,
              utilityMargin: 0,
              isCollapsed: false, // Track collapse state
            })),
          };
        } else {
          return category;
        }
      });
    } catch (error) {
      console.error("Error cargando el JSON:", error);
    } finally {
      loading.value = false;
    }
  };

  const clearSelectedJob = () => {
    if (selectedJob.value) {
      selectedJob.value.isCollapsed = false; // Collapse the previously selected job
    }
    selectedJobId.value = null;
    selectedJob.value = null;
  };

  const collapseAllJobs = () => {
    
    jobs.value.forEach(category => {
        if (category.subcategories) {
            category.subcategories.forEach(subcategory => {
                subcategory.jobs.forEach(job => {
                    job.isCollapsed = false; // Collapse all jobs
                    //console.log(job.isCollapsed);
                });
            });
        } else if (category.jobs) {
            category.jobs.forEach(job => {
                job.isCollapsed = false; // Collapse all jobs
            });
        }
    });
    
  };

  const toggleJobSelection = (job) => {
    if (selectedJobId.value === job.id) {
      clearSelectedJob(); // Deselect the job if it's already selected
    } else {
      clearSelectedJob(); // Deselect any previously selected job
      selectedJobId.value = job.id;
      selectedJob.value = job;
      job.isCollapsed = true; // Expand the newly selected job
    }
  };

  const resetSearch = () => {
    searchQuery.value = "";
    collapseAllJobs(); // Collapse all jobs
    //clearSelectedJob(); // Clear the selected job when resetting the search
  };

  // Getters
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

  const filteredCategories = computed(() => {
    if (!searchQuery.value) return jobs.value; // Si no hay búsqueda, muestra todo

    // Collapse all jobs and clear selection before performing the search
    collapseAllJobs();
    //clearSelectedJob();

    return jobs.value
      .map(category => {
        if (category.subcategories) {
          const filteredSubcategories = category.subcategories
            .map(subcategory => {
              const filteredJobs = subcategory.jobs.filter(job => {
                return (
                  job.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                  job.description.toLowerCase().includes(searchQuery.value.toLowerCase())
                );
              });

              return filteredJobs.length > 0 ? { ...subcategory, jobs: filteredJobs } : null;
            })
            .filter(Boolean);

          return filteredSubcategories.length > 0 ? { ...category, subcategories: filteredSubcategories } : null;
        } else if (category.jobs) {
          const filteredJobs = category.jobs.filter(job => {
            return (
              job.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
              job.description.toLowerCase().includes(searchQuery.value.toLowerCase())
            );
          });

          return filteredJobs.length > 0 ? { ...category, jobs: filteredJobs } : null;
        } else {
          return null;
        }
      })
      .filter(Boolean);
  });

  const totalValue = computed(() => {
    if (!selectedJob.value) return 0;
    const { base, extra, discount } = value.value;
    const { selectedHours, extraTime, utilityMargin } = selectedJob.value;

    let calc = (((base * (1 - discount / 100)) * (selectedHours + extraTime)) * (1 + utilityMargin / 100) + extra);
    return calc.toFixed(2);
  });

  const categoryHasSelectedJob = (category) => {
    if (category.subcategories) {
      return category.subcategories.some(subcategory =>
        subcategory.jobs.some(job => job.id === selectedJobId.value)
      );
    } else if (category.jobs) {
      return category.jobs.some(job => job.id === selectedJobId.value);
    }
    return false;
  };

  const subcategoryHasSelectedJob = (subcategory) => {
    return subcategory.jobs.some(job => job.id === selectedJobId.value);
  };

  const getSliderValues = (min, max) => {
    const range = max - min;
    if (range <= 5) {
      return Array.from({ length: range + 1 }, (_, i) => min + i);
    }

    const steps = Math.min(5, range);
    const stepSize = Math.ceil(range / steps);

    return Array.from({ length: steps + 1 }, (_, i) => min + i * stepSize).filter(v => v <= max);
  };

  return {
    searchQuery,
    jobs,
    value,
    loading,
    selectedJob,
    selectedJobId,
    fetchJobs,
    toggleJobSelection,
    resetSearch,
    filteredCategories,
    totalValue,
    categoryHasSelectedJob,
    subcategoryHasSelectedJob,
    getSliderValues,
  };
});