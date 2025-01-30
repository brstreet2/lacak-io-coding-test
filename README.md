# Lacak.io Backend Test

This project aim is to record, and keep a huge collection of cities across Canada and USA. I have noticed from the original data, several cities in the state of Minnesota were also missing. I improved it by adding an approve based contributing system, complete with user authentication system. Users can contribute to create a missing geo city, complete with all of the city information posted, but the data needs to be manually validated or approved by Community Moderator, where a moderator can approve and validate contributor's data.

## API Reference

For the API Reference please refer to a Postman link that I have created.

https://blue-flare-865064.postman.co/workspace/Team-Workspace~22f02c25-ec65-41d4-88d0-063c448472ec/collection/21527756-71b30769-8b42-42cf-ac63-d8823b8a62ec?action=share&creator=21527756

## Demo

lacak-io-coding-test-production.up.railway.app
(API only)

Available users:

- Community Moderator: moderator@gmail.com Password123!
- Contributor: azkatest040@gmail.com Password123!

## Authors

Should you have any questions about the project, please refer to my email: azkasecio0405@gmail.com, should the demo link doesn't work please clone this project, run it locally on your own computer.

- Email: azkasecio0405@gmail.com

## Installations

Should the demo link does not work, refer to this guide to run the project locally on your computer or laptop.

- Clone this project.
- Use any Node Package Manager to your preferences, in this instance I'm using PNPM, if you are using the same then the next step would be to go into the directory of this project and run 'pnpm install' in your terminal.
- Add environment variables listed below this guide.
- Open your terminal, and then run 'npx prisma generate'.
- You can customize which port you want to run the project at, in the '/src/index.ts' file.
- To run the project, simply type 'pnpm run start' in your terminal.

## Environment Variables

The following are variables to put in your '.env' file.

- DATABASE_URL="postgres://postgres.hzmgjgdfzmdqclccpxfj:UEMeHKNwV9fpICdt@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
- JWT_ACCESS_SECRET="ACCESS_SECRET"
- JWT_REFRESH_SECRET="REFRESH_SECRET"
