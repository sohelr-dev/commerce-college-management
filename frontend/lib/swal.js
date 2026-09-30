import Swal from 'sweetalert2';

export const swalColors = {
  primary: '#1E293B', // navy-900
  accent: '#D97706',  // gold-600
  danger: '#EF4444',
  success: '#10B981',
};

export const showAlert = (title, text = '', icon = 'info') => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: swalColors.primary,
    customClass: {
      popup: 'rounded-2xl shadow-xl font-sans',
      confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-medium',
    },
  });
};

export const showSuccess = (text = 'সফলভাবে সম্পন্ন হয়েছে', title = 'সফল!') => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: swalColors.primary,
    customClass: {
      popup: 'rounded-2xl shadow-xl font-sans',
      confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-medium',
    },
  });
};

export const showError = (text = 'কোনো একটি সমস্যা হয়েছে', title = 'ত্রুটি!') => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: swalColors.danger,
    customClass: {
      popup: 'rounded-2xl shadow-xl font-sans',
      confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-medium',
    },
  });
};

export const showConfirm = async (
  title = 'আপনি কি নিশ্চিত?',
  text = 'এই প্রক্রিয়াটি বাতিল করা যাবে না!',
  confirmButtonText = 'হ্যাঁ, নিশ্চিত',
  cancelButtonText = 'বাতিল'
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: swalColors.danger,
    cancelButtonColor: swalColors.primary,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      popup: 'rounded-2xl shadow-xl font-sans',
      confirmButton: 'rounded-xl px-5 py-2.5 text-sm font-medium',
      cancelButton: 'rounded-xl px-5 py-2.5 text-sm font-medium',
    },
  });

  return result.isConfirmed;
};

export const showToast = (title = 'সফল হয়েছে', icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon,
    title,
  });
};

export default {
  showAlert,
  showSuccess,
  showError,
  showConfirm,
  showToast,
};
