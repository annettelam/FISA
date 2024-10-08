// contactus.js

export async function POST({ request }) {
    try {
        const formData = await request.json();

        // Simulate form processing (e.g., log to console, save to database, or send email)
        console.log("Contact Form Submission:", formData);

        // Return a success response
        return new Response(
            JSON.stringify({ message: "Your message has been received." }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error processing contact form:", error);

        return new Response(
            JSON.stringify({ error: "There was a problem submitting your message." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
