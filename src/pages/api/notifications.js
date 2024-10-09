// Simulate a response with dummy notifications
export async function GET() {
    // Dummy data to simulate payment notifications
    const notifications = [
        { id: 1, school_name: "School A", payment_amount: 500.00, payment_date: new Date("2024-10-01T12:34:56") },
        { id: 2, school_name: "School B", payment_amount: 700.50, payment_date: new Date("2024-10-05T14:20:00") },
        { id: 3, school_name: "School C", payment_amount: 350.75, payment_date: new Date("2024-10-08T16:45:00") },
    ];

    // Return the notifications as a JSON response
    return new Response(JSON.stringify({
        unreadCount: notifications.length,
        notifications,
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
