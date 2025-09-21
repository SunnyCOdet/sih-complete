# Supabase Integration Setup Guide

This guide will help you set up Supabase as the database for your secure voting system.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your voting system project

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `secure-voting-system`
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` from your project
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema creation

This will create all the necessary tables:
- `voters` - Stores voter registration information
- `votes` - Stores individual votes
- `blocks` - Stores blockchain blocks
- `candidates` - Stores candidate information
- `voting_sessions` - Stores voting session information
- `public_keys` - Tracks used public keys

## Step 4: Configure Environment Variables

### Backend Configuration

Create a `.env` file in your project root with:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Other existing environment variables...
NODE_ENV=development
PORT=3000
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory with:

```env
REACT_APP_API_URL=http://localhost:3000/api/voting
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Mobile App Configuration

Create a `.env` file in the `voting-app` directory with:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/voting
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step 5: Install Dependencies

### Backend
```bash
npm install @supabase/supabase-js
```

### Frontend
```bash
cd frontend
npm install @supabase/supabase-js
```

### Mobile App
```bash
cd voting-app
npm install @supabase/supabase-js
```

## Step 6: Test the Integration

### Test Backend Connection

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Check the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

3. Test voter registration:
   ```bash
   curl -X POST http://localhost:3000/api/voting/register \
     -H "Content-Type: application/json" \
     -d '{"voterId":"test123","publicKey":"04testkey","registrationData":{}}'
   ```

### Test Frontend Connection

1. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

2. Open http://localhost:3001 in your browser
3. Try registering a voter and submitting a vote

### Test Mobile App Connection

1. Start the mobile app:
   ```bash
   cd voting-app
   npm start
   ```

2. Use the Expo Go app to scan the QR code
3. Test the voting functionality

## Step 7: Configure Row Level Security (RLS)

The schema includes basic RLS policies, but you may want to customize them based on your security requirements:

1. In Supabase dashboard, go to Authentication > Policies
2. Review and modify the policies for each table
3. Consider implementing more restrictive policies for production

## Step 8: Set Up Real-time Subscriptions (Optional)

The frontend and mobile app include real-time subscription capabilities:

1. In Supabase dashboard, go to Database > Replication
2. Enable real-time for the tables you want to monitor
3. The apps will automatically receive real-time updates

## Step 9: Production Considerations

### Security
- Use environment variables for all sensitive data
- Implement proper RLS policies
- Consider using Supabase Auth for user management
- Enable SSL/TLS for all connections

### Performance
- Set up database indexes for frequently queried columns
- Consider using Supabase Edge Functions for complex operations
- Monitor query performance in the Supabase dashboard

### Monitoring
- Set up alerts for database performance
- Monitor API usage and limits
- Track error rates and response times

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check that your Supabase URL and keys are correct
2. **Permission Denied**: Verify your RLS policies allow the operations you're trying to perform
3. **Rate Limiting**: Check your Supabase plan limits
4. **Schema Errors**: Ensure the database schema was created correctly

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=supabase:*
```

### Support

- Check the [Supabase Documentation](https://supabase.com/docs)
- Join the [Supabase Discord](https://discord.supabase.com)
- Check the project's GitHub issues

## Migration from File-based Storage

If you're migrating from the file-based storage system:

1. Export your existing data using the backup functionality
2. Create a migration script to import data into Supabase
3. Test thoroughly before switching over
4. Keep the old system as a backup during transition

## Next Steps

1. Set up automated backups
2. Implement monitoring and alerting
3. Consider setting up multiple environments (dev, staging, prod)
4. Plan for scaling as your user base grows
5. Implement proper logging and audit trails

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
