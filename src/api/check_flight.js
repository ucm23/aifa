import { Alert } from 'react-native';
import Fetcher from '../lib/Fetcher.js';
import { getData } from './login.js';

export const SUPABASE_URL = 'https://idnlcfdmgkviseokogdv.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbmxjZmRtZ2t2aXNlb2tvZ2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MTcxOTAsImV4cCI6MjA1OTQ5MzE5MH0._-FYJ6W-JnJj993AcpCdi_nzB4Q37lGVqeLHt5UX5i0'

export const checkFlight = async ({
    qr,
    claseVehicular,
    plate,
    idCarril,
    sentido,
    token
}) => {
    let response = {
        fetch: null,
        status: null,
        error: null, 
        json: null
    };
    try {

        const userLocal = await getData('user');
        //console.log("🚀 ~ checkFlight ~ userLocal:", userLocal)
        const laneLocal = await getData('lane');
        //console.log("🚀 ~ checkFlight ~ laneLocal:", laneLocal)

        const body = {
            qr,
        }
        if (claseVehicular) body.claseVehicular = claseVehicular
        if (plate) body.plate = plate

        let fetch_ = await Fetcher({
            method: 'POST',
            url: `qr/${idCarril}/${encodeURIComponent(sentido)}`,
            data: JSON.stringify(body),
        }, token);

        //console.log("🚀 ~ checkFlight ~ fetch.data:", JSON.stringify(fetch_, null, 4))
        response.fetch = fetch_.data;
        //console.log("🚀 ~ checkFlight ~ fetch_.status;:", fetch_.status)
        response.status = fetch_.status;

        if (fetch_.status == 200 && fetch_.data?.codigoRespuesta == 0) {
            //console.error(userLocal?.user?.place_id);
            if ([21, 22, 23, 24, 25, 26, 27, 28, 29].includes(parseInt(userLocal?.user?.place_id))) {
                const data = JSON.stringify({
                    plaza: userLocal?.place?.name,
                    carril: laneLocal?.name,
                    vuelo: fetch_.data?.vuelo,
                    aerolinea: fetch_.data?.aerolinea,
                    fecha_vuelo: fetch_.data?.fecha,
                    clase_vehicular: 'TA01s',
                    num_transaccion: '',
                    idqr: fetch_.data?.idQr,
                    token: '$2y$14$Vanss2017D3velp3rH./aq'
                });
                //console.log("🚀 ~ checkFlight ~ data 70:", data)

                const xhr = new XMLHttpRequest();
                xhr.withCredentials = true;

                xhr.addEventListener('readystatechange', function () {
                    if (this.readyState === this.DONE) {
                        console.log("🔵 Status:", this.status);
                        console.log("✅ Respuesta del servidor:", this.responseText);
                        try {
                            const responseJson = JSON.parse(this.responseText);
                            console.log("📋 Respuesta parseada:", responseJson);
                            response.json = data;
                            response.error = 1
                            //Alert.alert('Reporte de cruce', `${JSON.stringify(responseJson, null, 4)} -- ${JSON.stringify(data, null, 4)}`);
                        } catch (error) {
                            console.log("📄 Respuesta (texto plano):", this.responseText);
                            response.error = this.responseText
                            response.json = data;
                            //Alert.alert('Reporte de cruce', `${JSON.stringify(this.responseText, null, 4)} -- ${JSON.stringify(data, null, 4)}`);
                        }
                    }
                });

                xhr.addEventListener('load', function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('✅ Éxito:', xhr.responseText);
                    } else {
                        console.error(`⚠️ Error HTTP ${xhr.status}: ${xhr.statusText}`);
                        response.error = `⚠️ Error ${xhr.status}: ${xhr.statusText}`
                    }
                });


                //xhr.open('POST', 'https://corsproxy.io/?https://intranet.pinfra.mx/aifa/reporte-cruces/');
                xhr.open('POST', 'https://intranet.pinfra.mx/aifa/reporte-cruces/');
                //https://intranet.pinfra.mx/aifa/reporte-cruces/
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(data);
            }
        }
    } catch (error) {
        console.log("🚀 ~ checkFlight ~ error:", error)
        response.status = false
    } finally {
        return response;
    }
}


