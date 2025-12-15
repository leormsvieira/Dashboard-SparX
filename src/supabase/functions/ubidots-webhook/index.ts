// SparX - Ubidots Webhook Handler
// Esta Edge Function recebe dados do Ubidots e salva no Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UbidotsPayload {
  device_label?: string;
  variable_label?: string;
  value?: number;
  timestamp?: number;
  context?: {
    status?: string;
    device_label?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse payload do Ubidots
    const payload: UbidotsPayload = await req.json()
    
    console.log('📩 Webhook recebido do Ubidots:', payload)

    // Extrai dados do payload
    const deviceLabel = payload.device_label || payload.context?.device_label
    const temperature = payload.value
    const status = payload.context?.status || 'adequado'
    const timestamp = payload.timestamp 
      ? new Date(payload.timestamp) 
      : new Date()

    if (!deviceLabel || temperature === undefined) {
      throw new Error('device_label ou temperature não fornecidos')
    }

    // Busca o dispositivo pelo serial_number
    const { data: device, error: deviceError } = await supabaseClient
      .from('devices')
      .select('id, current_status')
      .eq('serial_number', deviceLabel)
      .single()

    if (deviceError) {
      console.error('❌ Erro ao buscar dispositivo:', deviceError)
      throw new Error(`Dispositivo ${deviceLabel} não encontrado`)
    }

    console.log('✓ Dispositivo encontrado:', device.id)

    // Insere leitura de temperatura
    const { data: reading, error: readingError } = await supabaseClient
      .from('temperature_readings')
      .insert({
        device_id: device.id,
        temperature: temperature,
        status: status,
        timestamp: timestamp
      })
      .select()
      .single()

    if (readingError) {
      console.error('❌ Erro ao inserir leitura:', readingError)
      throw readingError
    }

    console.log('✓ Leitura inserida:', reading.id)

    // Atualiza status do dispositivo
    const { error: updateError } = await supabaseClient
      .from('devices')
      .update({
        current_status: status,
        last_reading_at: timestamp
      })
      .eq('id', device.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar dispositivo:', updateError)
      throw updateError
    }

    console.log('✓ Status do dispositivo atualizado')

    // Cria alerta se status for precário ou crítico
    if (status === 'precario' || status === 'critico') {
      const alertMessage = status === 'critico'
        ? `⚠️ TEMPERATURA CRÍTICA: ${temperature}°C - Ação imediata necessária!`
        : `⚡ Temperatura elevada: ${temperature}°C - Monitoramento necessário`

      const { data: alert, error: alertError } = await supabaseClient
        .from('alerts')
        .insert({
          device_id: device.id,
          temperature: temperature,
          status: status,
          message: alertMessage
        })
        .select()
        .single()

      if (alertError) {
        console.error('❌ Erro ao criar alerta:', alertError)
      } else {
        console.log('✓ Alerta criado:', alert.id)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reading_id: reading.id,
        message: 'Dados processados com sucesso'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
