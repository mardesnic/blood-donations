import { useRouter } from 'next/navigation';

// Returns to the previous page (e.g. the donor or action the user came
// from), or to the fallback when the page was opened directly.
export const useGoBack = (fallback: string) => {
  const router = useRouter();
  return () => {
    if (window.history.length > 1) {
      router.back();
      router.refresh();
    } else {
      router.push(fallback);
    }
  };
};
