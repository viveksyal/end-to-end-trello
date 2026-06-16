// test.js
const BASE_URL = "http://localhost:3000";

async function api(method, path, body, token) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { token }),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
}

async function run() {
    console.log("=== Signing up admin ===");
    await api("POST", "/signup", { username: "admin", password: "pass123" });
    const { token } = await api("POST", "/signin", { username: "admin", password: "pass123" });
    console.log("Admin token acquired\n");

    console.log("=== Signing up 25 members ===");
    for (let m = 1; m <= 25; m++) {
        await api("POST", "/signup", { username: `member${m}`, password: "pass123" });
    }
    console.log("25 members signed up\n");

    for (let o = 1; o <= 10; o++) {
        console.log(`=== Creating Organisation ${o} ===`);
        const orgRes = await api("POST", "/organisation", {
            title: `Org ${o}`,
            description: `Description for org ${o}`,
        }, token);
        const orgId = orgRes.id;
        console.log(`Created with id: ${orgId}`);

        for (let m = 1; m <= 25; m++) {
            const addRes = await api("POST", "/add-member-to-organisation", {
                organisationId: orgId,
                memberUserUsername: `member${m}`,
            }, token);
            process.stdout.write(`  Added member${m}: ${addRes.message}\n`);
        }

        const orgDetails = await api("GET", `/organisation?organisationId=${orgId}`, null, token);
        console.log(`  Members in org ${o}: ${orgDetails.members?.length ?? "ERROR - " + orgDetails.message}\n`);
    }

    console.log("=== Done ===");
}

run().catch(console.error);