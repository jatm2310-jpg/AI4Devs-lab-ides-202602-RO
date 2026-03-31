import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import './App.css';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  experience: string;
};

const initialFormState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  education: '',
  experience: ''
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';
const RECRUITER_ACCESS_KEY = process.env.REACT_APP_RECRUITER_ACCESS_KEY || 'dev-recruiter-key';

type CandidateListItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  experience: string;
  cvFileName?: string | null;
  hasCv: boolean;
  createdAt: string;
};

function App() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [suggestions, setSuggestions] = useState<{ education: string[]; experience: string[] }>({
    education: [],
    experience: []
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [serverMessage, setServerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [candidateListError, setCandidateListError] = useState('');

  const fetchCandidates = async (targetPage: number): Promise<void> => {
    setIsLoadingCandidates(true);
    setCandidateListError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidates?page=${targetPage}&limit=8`);
      if (!response.ok) {
        throw new Error('No fue posible cargar candidatos.');
      }

      const data = await response.json();
      setCandidates(Array.isArray(data.items) ? data.items : []);
      setTotalPages(Math.max(1, Number(data?.pagination?.totalPages) || 1));
    } catch (_error) {
      setCandidateListError('No se pudo cargar la lista de candidatos.');
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/candidates/suggestions`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setSuggestions({
          education: Array.isArray(data.education) ? data.education : [],
          experience: Array.isArray(data.experience) ? data.experience : []
        });
      } catch (_error) {
        // Silently keep local defaults if suggestions cannot be loaded.
      }
    };

    fetchSuggestions();
  }, []);

  useEffect(() => {
    fetchCandidates(page);
  }, [page]);

  const clientValidationErrors = useMemo(() => {
    const validationErrors: string[] = [];
    const requiredFields: Array<keyof FormState> = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'address',
      'education',
      'experience'
    ];

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        validationErrors.push(`El campo ${field} es obligatorio.`);
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.push('El correo electronico no tiene un formato valido.');
    }

    if (cvFile) {
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const lowerCaseName = cvFile.name.toLowerCase();
      if (!allowedExtensions.some((extension) => lowerCaseName.endsWith(extension))) {
        validationErrors.push('El CV debe estar en formato PDF, DOC o DOCX.');
      }
      if (cvFile.size > 5 * 1024 * 1024) {
        validationErrors.push('El CV no puede superar los 5MB.');
      }
    }

    return validationErrors;
  }, [cvFile, formData]);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerMessage('');
    setErrors([]);

    if (clientValidationErrors.length > 0) {
      setErrors(clientValidationErrors);
      return;
    }

    const payload = new FormData();
    payload.append('firstName', formData.firstName.trim());
    payload.append('lastName', formData.lastName.trim());
    payload.append('email', formData.email.trim());
    payload.append('phone', formData.phone.trim());
    payload.append('address', formData.address.trim());
    payload.append('education', formData.education.trim());
    payload.append('experience', formData.experience.trim());
    if (cvFile) {
      payload.append('cv', cvFile);
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidates`, {
        method: 'POST',
        body: payload
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const responseErrors = Array.isArray(data.errors)
          ? data.errors
          : [data.message || 'No fue posible anadir el candidato.'];
        setErrors(responseErrors);
        return;
      }

      setServerMessage(data.message || 'Candidato anadido exitosamente.');
      setFormData(initialFormState);
      setCvFile(null);
      setPage(1);
      fetchCandidates(1);
    } catch (_error) {
      setErrors(['No se pudo conectar con el servidor. Intenta nuevamente.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCv = async (candidateId: number, fileName?: string | null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}/cv`, {
        headers: {
          'x-recruiter-key': RECRUITER_ACCESS_KEY
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'No fue posible descargar el CV.');
      }

      const blob = await response.blob();
      const temporaryUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = temporaryUrl;
      link.download = fileName || `cv-candidate-${candidateId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(temporaryUrl);
    } catch (error) {
      setCandidateListError(error instanceof Error ? error.message : 'Error al descargar CV.');
    }
  };

  return (
    <div className="App">
      <main className="dashboard" aria-labelledby="dashboard-title">
        <section className="hero-card">
          <h1 id="dashboard-title">Dashboard de Reclutamiento</h1>
          <p>
            Gestiona candidatos y acelera el proceso de seleccion con una interfaz clara, valida y compatible
            en escritorio y movil.
          </p>
          <button className="primary-button" type="button" onClick={() => setIsFormVisible(true)}>
            Anadir candidato
          </button>
        </section>

        {isFormVisible && (
          <section className="form-card" aria-labelledby="candidate-form-title">
            <div className="form-header">
              <h2 id="candidate-form-title">Nuevo candidato</h2>
              <button className="secondary-button" type="button" onClick={() => setIsFormVisible(false)}>
                Cerrar
              </button>
            </div>

            <form onSubmit={onSubmit} noValidate>
              <div className="grid-fields">
                <label>
                  Nombre*
                  <input name="firstName" value={formData.firstName} onChange={onInputChange} required />
                </label>
                <label>
                  Apellido*
                  <input name="lastName" value={formData.lastName} onChange={onInputChange} required />
                </label>
                <label>
                  Correo electronico*
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={onInputChange}
                    required
                  />
                </label>
                <label>
                  Telefono*
                  <input name="phone" value={formData.phone} onChange={onInputChange} required />
                </label>
                <label className="full-width">
                  Direccion*
                  <input name="address" value={formData.address} onChange={onInputChange} required />
                </label>
                <label>
                  Educacion*
                  <input
                    name="education"
                    value={formData.education}
                    onChange={onInputChange}
                    list="education-suggestions"
                    required
                  />
                </label>
                <label>
                  Experiencia laboral*
                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={onInputChange}
                    list="experience-suggestions"
                    required
                  />
                </label>
                <label className="full-width">
                  CV (PDF o DOCX)
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => setCvFile(event.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <datalist id="education-suggestions">
                {suggestions.education.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              <datalist id="experience-suggestions">
                {suggestions.experience.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>

              {errors.length > 0 && (
                <div className="alert error" role="alert" aria-live="assertive">
                  {errors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}

              {serverMessage && (
                <div className="alert success" role="status" aria-live="polite">
                  {serverMessage}
                </div>
              )}

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar candidato'}
              </button>
            </form>
          </section>
        )}

        <section className="form-card" aria-labelledby="candidate-list-title">
          <div className="form-header">
            <h2 id="candidate-list-title">Candidatos registrados</h2>
            <button className="secondary-button" type="button" onClick={() => fetchCandidates(page)}>
              Refrescar
            </button>
          </div>

          {candidateListError && (
            <div className="alert error" role="alert" aria-live="assertive">
              {candidateListError}
            </div>
          )}

          {isLoadingCandidates ? (
            <p>Cargando candidatos...</p>
          ) : candidates.length === 0 ? (
            <p>No hay candidatos registrados aun.</p>
          ) : (
            <div className="candidate-table-wrapper">
              <table className="candidate-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Telefono</th>
                    <th>Educacion</th>
                    <th>CV</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>{`${candidate.firstName} ${candidate.lastName}`}</td>
                      <td>{candidate.email}</td>
                      <td>{candidate.phone}</td>
                      <td>{candidate.education}</td>
                      <td>
                        {candidate.hasCv ? (
                          <button
                            type="button"
                            className="secondary-button compact"
                            onClick={() => downloadCv(candidate.id, candidate.cvFileName)}
                          >
                            Descargar CV
                          </button>
                        ) : (
                          <span>Sin CV</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pagination-row">
            <button
              type="button"
              className="secondary-button compact"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <span>
              Pagina {page} de {totalPages}
            </span>
            <button
              type="button"
              className="secondary-button compact"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
