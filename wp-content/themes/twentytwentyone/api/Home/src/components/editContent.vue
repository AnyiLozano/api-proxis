<template>
  <div
      class="modal fade"
      id="editContent"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Editar Contenido</h5>
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
                    v-model="data_edit.position_in_page"
                />
              </div>
              <div class="col-md-6">
                <label class="text-sm-left"><b>Tipo de contenido</b></label>
                <v-select :options="contentTypes" label="name" v-model="data_edit.type"></v-select>
              </div>
              <div class="col-md-12">
                <label><b>Contenido</b></label>
                <textarea class="form-control" v-if="data_edit.type && data_edit.type.id ? data_edit.type.id == '1' : data_edit.type == 'Text'" v-model="data_edit.content"></textarea>
                <div class="col-md-12" v-else>
                  <div class="col-md-12">
                    <label for="image" class="btn btn-info">
                      Seleccionar imagen
                    </label>
                    <input type="file" @change.prevent="selectedFile" id="image" style="display: none"/>
                  </div>
                  <div class="col-md-12">
                    <img :src="image_content" alt="Image Content" width="150" v-if="image_content != ''"/>
                    <img :src="data_edit.content" alt="Image Content" width="150" v-else/>
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
  name: "EditContent",
  props: {
    data_edit: {
      required: true
    }
  },
  data: () => ({
    contentTypes: [],
    content: "",
    image_content: ""
  }),
  mounted(){
    this.getTypes();
    console.log(this.data_edit)
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
      this.data_edit.content = image;
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = (event) => {
        this.image_content = event.target.result;
      }
    },
    setContent(){
      let formData = new FormData();
      formData.append("content", this.data_edit.content);
      if(this.data_edit.type.id){
        formData.append("type", this.data_edit.type.id);
      }else{
        formData.append("type", this.data_edit.type);
      }
      formData.append("position", this.data_edit.position_in_page);
      formData.append("page", 1);
      formData.append("id", this.data_edit.id)

      let loader = this.$loading.show();
      axios.post("admin/home/edit-content", formData)
          .then((res) => {
            loader.hide();

            const { transaction, message } = res.data;

            if(transaction.status === true){
              this.$emit("editContent");
              this.$swal({
                icon: "success",
                text: "Se edito exitosamente el contenido"
              });
              $("#editContent").modal("hide");
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