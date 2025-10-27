<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registro de nuevo usuario
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|in:admin,nutricionista,paciente',
            'fecha_nacimiento' => 'required_if:role,paciente|date',
            'genero' => 'required_if:role,paciente|in:M,F,Otro',
            'telefono' => 'nullable|string|max:20',
        ]);

        DB::beginTransaction();

        try {
            $role = $request->role ?? 'paciente';

            // Crear usuario
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $role,
                'telefono' => $request->telefono,
            ]);

            // Si es paciente, crear registro en tabla pacientes
            if ($role === 'paciente') {
                // Separar nombre y apellido
                $nameParts = explode(' ', $request->name, 2);
                $nombre = $nameParts[0];
                $apellido = $nameParts[1] ?? '';

                $paciente = Paciente::create([
                    'user_id' => $user->id,
                    'nombre' => $nombre,
                    'apellido' => $apellido,
                    'fecha_nacimiento' => $request->fecha_nacimiento,
                    'genero' => $request->genero,
                    'email' => $request->email,
                    'telefono' => $request->telefono,
                    'peso_inicial' => null,
                    'estatura' => null,
                    'alergias' => null,
                    'id_nutricionista' => null,
                ]);

                // Agregar id_paciente al usuario
                $user->id_paciente = $paciente->id_paciente;
                $user->paciente = $paciente;
            }

            DB::commit();

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Usuario registrado exitosamente',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login de usuario
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Revocar tokens anteriores
        $user->tokens()->delete();

        // Si es paciente, cargar información adicional
        if ($user->role === 'paciente') {
            $paciente = Paciente::where('user_id', $user->id)->first();
            if ($paciente) {
                $user->id_paciente = $paciente->id_paciente;
                $user->paciente = $paciente;
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout de usuario
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
