import { useState, useEffect } from "react";
import { testimonialService, type Testimonial } from "@/services/testimonial.service";

export function usePublicTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    testimonialService
      .getPublicTestimonials()
      .then((res: { data: Testimonial[] }) => {
        if (mounted) {
          setTestimonials(res.data || []);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (mounted) {
          setError(err);
          setTestimonials([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { testimonials, loading, error };
}
