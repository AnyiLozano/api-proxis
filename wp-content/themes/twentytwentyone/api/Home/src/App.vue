<template>
  <div class="col-lg-12">
    <div class="container">
      <div class="card mw-100">
        <div class="card-body">
          <div class="col-md-12">
            <button
                type="button"
                class="btn btn-primary"
                data-toggle="modal"
                data-target="#createContent"
            >Crear contenido
            </button>
          </div>
          <div class="col-md-12">
            <v-client-table
                class="table-striped"
                :columns="columns"
                :data="data"
                :options="{headings, sortable, filterByColumn}"
            >
              <slot slot="content" slot-scope="props">
                <span v-if="props.row.type !== 'Image'">{{ props.row.content }}</span>
                <img v-else :src="props.row.content" alt="Image Content" width="120"/>
              </slot>
              <slot slot="status" slot-scope="props">
                <span class="textStatus" :style="{backgroundColor: props.row.color_status}">{{
                    props.row.status
                  }}</span>
              </slot>
              <slot slot="Opciones" slot-scope="props">
                <button type="button" class="btn btn-outline-primary" @click="openModal('#editContent', props.row)">Editar</button>
                <button type="button" class="btn btn-outline-danger">Eliminar</button>
              </slot>
            </v-client-table>
          </div>
          <CreateContent @createContent="getContent"/>
          <EditContent :data_edit="data_edit" @editContent="getContent"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import CreateContent from "./components/createContent";
import EditContent from "./components/editContent";

export default {
  name: "App",
  components: {
    CreateContent,
    EditContent
  },
  data: () => ({
    columns: [
      "id",
      "page",
      "type",
      "content",
      "position_in_page",
      "status",
      "Opciones"
    ],
    headings: {
      id: "id",
      content: "Contenido",
      position_in_page: "Posición en la pagina",
      status: "Estado",
      type: "Tipo de contenido",
      page: "Pagina"
    },
    filterByColumn: false,
    sortable: ["id"],
    data: [],
    data_edit: {}
  }),
  mounted() {
    this.getContent();
  },
  methods: {
    getContent() {
      let loader = this.$loading.show();
      axios.get("/admin/home/get-home-content")
          .then((res) => {
            loader.hide();
            const {transaction, data} = res.data;
            if (transaction.status === true) {
              this.data = data;
            } else {
              this.$swal({
                icon: "error",
                text: "Ocurrio un problema al momento de obtener los contenidos."
              })
            }
          }).catch((err) => {
        loader.hide();
        console.log(err);
        this.$swal({
          icon: "error",
          text: "Ocurrio un momento al obtener los contenidos."
        })
      })
    },
    openModal(id, data){
      this.data_edit = data;
      $(id).modal('show');
    }
  }
}
</script>
<style>
.textStatus {
  color: #ffffff;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 20px;
}
</style>