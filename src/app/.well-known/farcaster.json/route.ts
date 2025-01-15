export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL;

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOiA4ODcyNDYsICJ0eXBlIjogImN1c3RvZHkiLCAia2V5IjogIjB4N0Q0MDBGRDFGNTkyYkI0RkNkNmEzNjNCZkQyMDBBNDNEMTY3MDRlNyJ9",
      payload: "eyJkb21haW4iOiAib25zZW5ib3QtZmxvd2xpbmtmcmFtZS1mcmFtZWNlcHRpb24tdjIudmVyY2VsLmFwcCJ9",
      signature: "iBIlfRgBeFL0Sw-QRTZ9RKyA8BMsgPdXjbLk5wHxdJBUv-S3FDjOYzYC3lxgkFOEjJYGXgZtIB1qhxbdaNg45Rw"
    },
    frame: {
      version: "1",
      name: "Frames v2 Demo",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frames/hello/opengraph-image`,
      buttonTitle: "Launch Frame",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
