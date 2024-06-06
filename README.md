**Steps to setup this project:**

1. Clone this directory and `modex-store`.
2. Run `npm i` on both directories.
3. Make a Supabase account, Clerk account, and a Cloudinary account. (if needed for payments also a stripe account)
    - Get all the secret keys, names, everything you need to put in the `.env.example` file.
4. Fill in the `env.example` file on the admin side and change the file name to `.env`.
5. Run `npm run dev` on the admin side.
6. Create an account and a store, then go to settings.
7. Copy the API link of the store and put it in the `env.example` on the store side, and change the file name to `.env.example`.
8. Run `npm run dev` on the store side as well.
9. You're now ready to add data!

That's it!
