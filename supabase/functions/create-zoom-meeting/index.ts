import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID');
    const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID');
    const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET');

    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      console.log('Zoom credentials not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Zoom integration not configured',
          message: 'Please configure ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in Supabase secrets'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { topic, start_time, duration, agenda } = await req.json();

    console.log('Creating Zoom meeting:', { topic, start_time, duration });

    // Get OAuth access token using Server-to-Server OAuth
    const tokenResponse = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get Zoom token:', errorText);
      throw new Error('Failed to authenticate with Zoom');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Create the meeting
    const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic || 'Music Lesson',
        type: 2, // Scheduled meeting
        start_time: start_time,
        duration: duration || 60,
        timezone: 'Africa/Nairobi',
        agenda: agenda || 'Music lesson via Tunetrails',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: false,
          waiting_room: false,
          auto_recording: 'none',
        },
      }),
    });

    if (!meetingResponse.ok) {
      const errorText = await meetingResponse.text();
      console.error('Failed to create Zoom meeting:', errorText);
      throw new Error('Failed to create Zoom meeting');
    }

    const meetingData = await meetingResponse.json();
    
    console.log('Zoom meeting created successfully:', meetingData.id);

    return new Response(
      JSON.stringify({
        meeting_id: meetingData.id,
        join_url: meetingData.join_url,
        start_url: meetingData.start_url,
        password: meetingData.password,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating Zoom meeting:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
