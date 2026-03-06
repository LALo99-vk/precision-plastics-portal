/**
 * Supabase Edge Function: send-quotation-email
 *
 * Sends a professional quotation email to the customer with a link
 * to view/download/accept the quotation.
 *
 * Expects POST body:
 *   { to_email, customer_name, proforma_number, quotation_url, document_id }
 *
 * Uses Resend API (set RESEND_API_KEY in Supabase secrets).
 * Alternatively swap for any SMTP/SendGrid/Mailgun.
 *
 * Deploy: supabase functions deploy send-quotation-email --no-verify-jwt
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const { to_email, customer_name, proforma_number, quotation_url, document_id } = await req.json();

    if (!to_email || !quotation_url) {
      return json({ error: 'to_email and quotation_url are required' }, 400);
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:20px">
          <h1 style="margin:0;font-size:22px">NYLOKING & CO .,</h1>
          <p style="margin:4px 0 0;font-size:11px;letter-spacing:2px;color:#555">HOUSE OF ENGINEERING PLASTICS</p>
        </div>
        <p>Dear ${customer_name || 'Customer'},</p>
        <p>Your quotation <strong>${proforma_number || ''}</strong> from Nyloking & Co. is ready.</p>
        <p>You can view the quotation, download the PDF, and accept or request changes using the link below:</p>
        <p style="text-align:center;margin:30px 0">
          <a href="${quotation_url}" style="background:#000;color:#fff;padding:14px 32px;text-decoration:none;font-weight:bold;font-size:14px;border-radius:6px;display:inline-block">View Quotation</a>
        </p>
        <p style="color:#888;font-size:12px">If the button doesn't work, copy and paste this link: <a href="${quotation_url}">${quotation_url}</a></p>
        <hr style="border:none;border-top:1px solid #ddd;margin:30px 0" />
        <p style="color:#666;font-size:12px">Nyloking & Co.<br/>No. 161/1, S.P. Road, Bengaluru-560002, Karnataka, India<br/>Phone: 9448354795 | Email: nylokingandco@gmail.com</p>
      </div>
    `;

    // Send email via Resend
    if (RESEND_API_KEY) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'Nyloking & Co. <quotations@nyloking.com>',
          to: [to_email],
          subject: `Quotation ${proforma_number || ''} - Nyloking & Co.`,
          html,
        }),
      });
      if (!emailRes.ok) {
        const err = await emailRes.text();
        return json({ error: `Email API error: ${err}` }, 500);
      }
    }

    // Update document status to "sent"
    if (document_id && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await sb.from('quotation_documents').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', document_id);
    }

    return json({ success: true });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
