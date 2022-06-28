<template>
  <v-row>
    <v-col>
      <v-data-table
        :items="users"
        :headers="headers"
        dense
      >
        <template #item.roles="{ item }">
          <td>
            <v-chip-group>
              <v-chip
                v-for="role in item.roles"
                :key="role"
                small
                label
              >
                {{ role }}
              </v-chip>
            </v-chip-group>
          </td>
        </template>
        <template #item.scope="{ item }">
          <td>
            <v-chip-group>
              <v-chip
                v-for="scope in item.scope"
                :key="scope"
                small
                label
              >
                {{ scope }}
              </v-chip>
            </v-chip-group>
          </td>
        </template>
        <template #item.createdAt="{ item }">
          <td style="text-align: right">
            {{ item.createdAt | timeSince }}
          </td>
        </template>
        <template #item.patreon="{ item }">
          <td>
            <v-icon color="error" :disabled="!item.patreon" :title="item.patreonActiveUntil">mdi-patreon</v-icon>
          </td>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
const fixedTime = new Date();

export default {
  name: 'AdminUserOverview',
  filters: {
    timeSince(value) {
      const date = new Date(value);
      const seconds = Math.floor((fixedTime - date) / 1000);

      let interval = Math.floor(seconds / 31536000);

      interval = Math.floor(seconds / 86400);

      if (interval > 30) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      }

      if (interval > 1) {
        return interval + ' days ago';
      }
      interval = Math.floor(seconds / 3600);
      if (interval > 1) {
        return interval + ' hours ago';
      }
      interval = Math.floor(seconds / 60);
      if (interval > 1) {
        return interval + ' minutes ago';
      }
      return Math.floor(seconds) + ' seconds ago';
    },
  },
  layout: 'admin',
  middleware: 'isAdmin',
  async asyncData({ $axios }) {
    const { data: users } = await $axios('/api/users');
    return {
      users,
    };
  },
  data() {
    return {
      headers: [
        { text: 'Username', align: 'start', value: 'username' },
        { text: 'Enabled', align: 'center', value: 'enabled' },
        { text: 'Created at', align: 'end', value: 'createdAt' },
        { text: 'Roles', align: 'start', value: 'roles' },
        { text: 'Patreon', align: 'center', value: 'patreon' },
      ],
    };
  },
};
</script>

<style scoped>

</style>
