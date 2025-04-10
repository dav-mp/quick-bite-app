import { useNavigate, NavigateFunction, NavigateOptions } from 'react-router-dom';

const useRedirect = (): ((path: string, options?: NavigateOptions) => void) => {
  const navigate: NavigateFunction = useNavigate();

  /**
   * Cambia la ruta a la ruta especificada.
   * @param path - La ruta a la que se desea navegar.
   * @param options - Opciones adicionales para la navegación (opcional), por ejemplo { replace: true }.
   */
  const redirect = (path: string, options?: NavigateOptions): void => {
    navigate(path, options);
  };

  return redirect;
};

export default useRedirect;
