<script>
import axios from 'axios';

const CheckToken = async function() {
  try {
    if (localStorage.getItem('API-TOKEN')) {
      const token = localStorage.getItem('API-TOKEN')

      const response = await axios.get('http://localhost:3000/api', {
        headers: {
          'X-API-TOKEN': token
        }
      });

      return response.status === 200
    }

    return 401
  } catch (error) {
    return error.response.status
  }
}

export default CheckToken;

</script>
