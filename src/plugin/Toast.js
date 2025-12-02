import Swal from 'sweetalert2'

function Toast(icon, title, text) {
  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })

  return Toast.fire({
    icon: icon,
    title: title,
    text: text,
  })
}

export default Toast
