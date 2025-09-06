import { useRouter } from 'vue-router';
import { ref } from 'vue';

export function useCommonUtilities() {
  const router = useRouter();

  function capitalizeFirstLetter(string) {
    let lowercasedString = string.toLowerCase();
    return lowercasedString.charAt(0).toUpperCase() + lowercasedString.slice(1);
  }

  function goToRoute(path) {
    router.push(path);
  }

  async function copyToClipboard(textToCopy) {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  return {
    capitalizeFirstLetter,
    goToRoute,
    copyToClipboard,
  };
}
