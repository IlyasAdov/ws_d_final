<template>
    <div class="error-container">
        <p v-if="errorStatus == 400">400 Bad Request</p>
        <p v-if="errorStatus == 401">401 Unauthorized</p>
        <p v-if="errorStatus == 403">403 Forbidden</p>
        <p v-if="errorStatus == 503">503 Service Unavailable</p>
        <span class="close-error" @click="closeError()">&times;</span>
    </div>
</template>

<script>
    export default {
        props: {
            errorStatus: Number
        },

        methods: {
            closeError() {
                this.$emit('update:errorStatus', null)
            }
        }
    }
</script>

<style scoped>
    .error-container {
        position: fixed;
        top: 10px;
        right: 10px;
        width: 25%;
        height: auto;
        background-color: rgb(224, 224, 2);
        border-radius: 10px;
        padding: 10px;
        color: white;
        font-weight: 600;
        font-size: 20px;
    }

    .close-error {
        position: absolute;
        top: 0;
        right: 10px;
        font-size: 30px;
        color: white;
        cursor: pointer;
    }
</style>