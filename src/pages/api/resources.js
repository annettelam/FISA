// resources.js

export async function GET() {
    // Dummy resource data
    const resources = [
        {
            id: 1,
            title: "Resource Title 1",
            description: "Description for resource 1. This resource will help you understand the basics.",
            downloadLink: "/downloads/resource1.pdf"
        },
        {
            id: 2,
            title: "Resource Title 2",
            description: "Description for resource 2. This resource offers advanced knowledge and tutorials.",
            downloadLink: "/downloads/resource2.pdf"
        },
        {
            id: 3,
            title: "Resource Title 3",
            description: "A complete guide to get started with our platform.",
            downloadLink: "/downloads/resource3.pdf"
        }
    ];

    return new Response(JSON.stringify(resources), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
