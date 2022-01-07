<template>
  <div class="col-lg-12">
    <div class="container">
      <div class="card mw-100">
        <div class="card-body">
          <v-client-table
              :columns="columns"
              :data="data"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "App",
  data: () => ({
    columns: [
        "id",
        "content",
        "position_in_page",
        "status",
        "Opciones"
    ],
    data: []
  })
}
</script>