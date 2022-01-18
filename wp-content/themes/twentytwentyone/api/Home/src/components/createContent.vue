<template>
  <div
      class="modal fade"
      id="createContent"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Crear contenido para la pagina home</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="container">
            <form class="row">
              <div class="col-md-6">
                <label><b>Posición</b></label>
                <input
                    type="number"
                    class="form-control input-number"
                    v-model="content.position"
                />
              </div>
              <div class="col-md-6">
                <label class="text-sm-left"><b>Tipo de contenido</b></label>
                <v-select :options="contentTypes" label="name" v-model="content.type"></v-select>
              </div>
              <div class="col-md-12">
                <label><b>Contenido</b></label>
                <textarea class="form-control" v-if="content.type.id == 1" v-model="content.content"></textarea>
                <div class="col-md-12" v-else>
                  <div class="col-md-12">
                    <label for="image" class="btn btn-info">
                      Seleccionar imagen
                    </label>
                    <input type="file" @change.prevent="selectedFile" id="image" style="display: none"/>
                  </div>
                  <div class="col-md-12">
                    <img :src="image_content" alt="Image Content" width="150" v-if="image_content"/>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click.prevent="setContent">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "createContent",
  data: () => ({
    content: {
      position: null,
      type: {
        id: 1,
        name: ""
      },
      content: null
    },
    contentTypes: [],
    image_content: null
  }),
  mounted(){
    this.getTypes();
  },
  methods: {
    getTypes(){
      let loader = this.$loading.show();
      axios.get("/admin/general/get-content-types")
      .then((res) => {
        loader.hide();
        const { transaction, data } = res.data;

        if(transaction.status){
          this.contentTypes = data;
        }else{
          this.$swal({
            icon: "error",
            text: "No se pudo obtener los tipos de contenido."
          })
        }
      }).catch((err) => {
        console.log(err);
        this.$swal({
          icon: "error",
          text: "No se pudo obtener los tipos de contenido."
        })
      })
    },
    selectedFile(e){
      const image = e.target.files[0];
      console.log(image)
      this.content.content = image;
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = (event) => {
        this.image_content = event.target.result;
      }
    },
    setContent(){
      let formData = new FormData();
      formData.append("content", this.content.content);
      formData.append("type", this.content.type.id);
      formData.append("position", this.content.position);
      formData.append("page", 1);

      let loader = this.$loading.show();
      axios.post("admin/home/set-content", formData)
      .then((res) => {
        loader.hide();

        const { transaction, message } = res.data;

        if(transaction.status === true){
          this.$emit("createContent");
          this.$swal({
            icon: "success",
            text: "Se creo exitosamente el contenido"
          });
          $("#createContent").modal("hide");
        }else{
          this.$swal({
            icon: "error",
            text: message.content
          })
        }
      }).catch((err) => {
        loader.hide();
        console.log(err);
        this.$swal({
          icon: "error",
          text: "Ocurrio un problema al momento de crear el contenido."
        })
      })
    }
  }
}
</script>