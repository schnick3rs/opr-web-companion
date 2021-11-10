<template>
  <div class="card__container" :class="{ 'card__container--weapon': card.weapon }">
    <img class="card__frame" src="" width="100%" />
    <div class="card__name">{{card.name}}</div>
    <div class="card__faction">{{card.faction}}</div>
    <div class="card__weapon" v-if="card.weapon">
      <span class="card__weapon-name">{{card.weapon.name}}</span>
      <span class="card__weapon-name" v-if="card.weapon.traits.length > 0"> - {{card.weapon.traits.join(', ')}}</span>
      <div class="card__weapon-stats">
        <span class="card__weapon-stat card__weapon-stat--range">{{card.weapon.range}}</span>
        <span class="card__weapon-stat card__weapon-stat--strength">{{card.weapon.strength}}</span>
        <span class="card__weapon-stat card__weapon-stat--damage">{{card.weapon.damage}}</span>
      </div>
      <div class="card__weapon-effect">{{card.weapon.effect}}</div>
      <div class="card__weapon-effect">{{card.effect}}</div>
    </div>
    <div class="card__content" v-else>{{card.effect}}</div>
    <div class="card__cost">Cost: {{card.cost}}pts</div>
  </div>
</template>

<script>
export default {
  name: "OprGfArenaUpgradeCard",
  props: {
    card: Object,
  },
}
</script>

<style scoped lang="scss">
.card {

  // 1044 x 743
  // 251 x 186

  &__container {
    position: relative;
    background-image: url('/img/gf-arena/gf-arena-upgrade-card-template.png');
    background-size: contain;
    height: 251px;
    width: 186px;

    &--weapon {
      background-image: url('/img/gf-arena/gf-arena-upgrade-card-template-weapon.png');
    }
  }

  &__frame {
    display: none;
  }

  &__name {
    //position: absolute;
    //top:  0;
    padding-top: 5px;
    font-size: 10px;
    text-align: center;
    text-transform: uppercase;
  }

  &__faction {
    font-size: 8px;
    text-align: center;
  }

  &__content {
    position: absolute;
    top: 90px;
    left: 20px;
    width: 140px;
    font-size: 10px;
  }

  &__weapon {
    position: absolute;
    top: 90px;
    left: 20px;
    width: 140px;
    font-size: 10px;
  }

  &__weapon-name {

  }

  &__weapon-traits {

  }

  &__weapon-stats {
  }

  &__weapon-stat {
    font-size: 16px;
    margin-left: 26px;
  }

  &__weapon-effect {
    width: 140px;
    margin-top: 10px;
    font-size: 10px;
  }

  &__cost {
    font-size: 10px;
    text-align: center;
    position: absolute;
    bottom: 15px;
    width: 100%;
  }

}
</style>
