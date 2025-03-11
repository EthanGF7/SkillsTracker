"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import OnboardingFlow from "./onboarding-flow"
import Header from "./header"
import SkillsSelection from "./skills-selection"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSkillsSelection, setShowSkillsSelection] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showInactivityMessage, setShowInactivityMessage] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  useEffect(() => {
    const inactivityTimeout = 60000; // 1 minuto en milisegundos
    
    const resetTimer = () => {
      setLastActivity(Date.now());
      setShowInactivityMessage(false);
    };

    const checkInactivity = () => {
      const currentTime = Date.now();
      if (currentTime - lastActivity >= inactivityTimeout) {
        setShowInactivityMessage(true);
      }
    };

    // Eventos para detectar actividad del usuario
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Comprobar inactividad cada 10 segundos
    const intervalId = setInterval(checkInactivity, 10000);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      clearInterval(intervalId);
    };
  }, [lastActivity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLogin && acceptedTerms) {
      setShowOnboarding(true)
    } else if (isLogin) {
      // Al iniciar sesión, mostrar directamente la selección de habilidades
      setShowSkillsSelection(true)
    } else {
      console.log("Please accept the terms and conditions")
    }
  }

  const handleOnboardingComplete = () => {
    console.log("Onboarding completed")
    // Add any additional logic here
  }

  // Si estamos en la selección de habilidades, mostrar ese componente
  if (showSkillsSelection) {
    return <SkillsSelection />
  }

  // Si estamos en el onboarding (solo para registro), mostrar ese componente
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F8FAFF] to-[#F0F4FF]">
      <Header />
      {showInactivityMessage && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-4 text-center">
          <p className="text-yellow-800">
            ¿Sigues ahí? Has estado inactivo durante un minuto. Por favor, interactúa con la página para continuar.
          </p>
        </div>
      )}
      <div className="container mx-auto px-6 pt-24 pb-8">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-indigo-600">Bienvenido a Skills Tracker</h1>
            <p className="text-gray-600">Herramienta de Autoevaluación y Desarrollo de Soft Skills</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-indigo-600">
                    Nombre
                  </Label>
                  <Input id="nombre" placeholder="Escribe tu nombre" className="bg-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido" className="text-indigo-600">
                    Apellido
                  </Label>
                  <Input id="apellido" placeholder="Escribe tu apellido" className="bg-white" required />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-indigo-600">
                Email
              </Label>
              <Input id="email" type="email" placeholder="Escribe tu email" className="bg-white" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-indigo-600">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Escribe tu contraseña"
                  className="bg-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked: boolean) => setAcceptedTerms(checked)}
                  className="border-2 border-indigo-600 data-[state=checked]:bg-indigo-600"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-gray-700 cursor-pointer hover:text-indigo-600"
                >
                  Acepto los términos y condiciones
                </Label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:hover:bg-gray-300"
              disabled={!isLogin && !acceptedTerms}
            >
              {isLogin ? "Inicia sesión" : "Registrarme"}
            </Button>

            {!isLogin && !acceptedTerms && (
              <p className="text-sm text-red-500 text-center">
                Por favor, acepta los términos y condiciones para continuar
              </p>
            )}

            <Button type="button" variant="outline" className="w-full border-2 bg-white hover:bg-gray-50">
              <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isLogin ? "Inicia sesión con Google" : "Continúa con Google"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta con nosotros?"}{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-indigo-600 hover:text-indigo-800"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setAcceptedTerms(false)
                }}
              >
                {isLogin ? "Regístrate" : "Inicia Sesión"}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
